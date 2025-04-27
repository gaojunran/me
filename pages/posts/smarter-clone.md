---
title: 更聪明的克隆命令
date: 2025-04-27T00:00:00Z
lang: zh
duration: 14min
---

[[toc]]

> 全文的脚本都是[`nushell`](https://www.nushell.sh/)的脚本，这可能是 Shell Script 中可读性最强的了。你也可以自己编写其它脚本。

前面的博文提到我是一个实用主义的人，但同时我也是一个懒人😂。我经常需要克隆一个仓库，`git clone + url`的命令似乎有点太长。我想写一个自定义命令`clone`，它足够灵活，可以接收**六种参数**：

- 空参。此时它会向我的浏览器 [Arc](https://arc.net/) 中查找打开的所有 GitHub 页面，然后打开 fzf 交互式选择器让我选择其中之一。
- 接收一个仓库的 url。它会解析出 owner 和 repo，然后执行`gh repo clone owner/repo`。
- 接收一个`gh cli`登录账号本人的仓库名。（格式`!repo`）。此时它的行为和`gh repo clone`一样。
- 接收一个命名空间下的仓库名（格式`owner/repo`）。此时它的行为和`git clone`一样。
- 接收一个作者名（格式`@owner`）。此时它会查询该作者的所有仓库，并打开 fzf 交互式选择器让我选择其中之一。
- 接收一个纯仓库名。此时它会查询此仓库名，并打开 fzf 交互式选择器让我选择其中之一。

克隆仓库之后，可以自动`cd`到该仓库的目录下。

最有意思的其实是第一个。我会放在最后讲我是怎么实现的。

## 解析`url`

`git clone`只接受一个标准的远程仓库地址，但我们通常可能会进到一个`GitHub`的页面，它未必是该仓库的首页（如https://github.com/watchexec/watchexec/issues/525），此时`git clone`会报错：

```
$ git clone https://github.com/watchexec/watchexec/issues/525
Cloning into '525'...
remote: Not Found
fatal: repository 'https://github.com/watchexec/watchexec/issues/525/' not found
```

所以我们可以编写一个使用正则的函数来从`url`中解析出仓库全名（`owner/repo`格式）：

```nushell
def parse-url [url: string] {
  $url
  | parse --regex 'http[s]?\://github.com/(?P<owner>.*?)/(?P<repo>.*?)/.*'
  | first
  | ($in.owner + "/" + $in.repo)
}
```

可以注意到我们又使用了正则表达式的捕获组特性（在 [这篇](/posts/my-git-workflow-2) 博文中也提到过）。`.*?`中的问号表示**非贪婪匹配**，表示我们想匹配尽量少的字符，一遇到`/`就停止匹配。

## `url`, `!repo`, `owner/repo`

编写一个简单的辅助函数：

```nushell
def clone-and-cd --env [fullName: string] {
  gh repo clone $fullName
  cd ($fullName | str substring (($fullName | str index-of "/") + 1)..)
}
```

这样对于很多种情况，只要我们转换成`fullName`(`owner/repo`格式)就可以直接调用这个函数，实现了代码的复用。

```nushell
export def clone --env [
  name?: string # allow 4 kinds of input: url, owner/repo, @owner, repo
] {
  if $name == null {
    # TODO
  } else if ($name =~ 'http[s]?\://github.com/.*') {
    # Format: url, allow sub-url of the repo
    clone-and-cd (parse-url $name)
  } else if ($name | str contains "!") {
    # Format: !repo, owner is current user of gh
    gh repo clone ($name | str replace "!" "")
    cd ($name | str replace "!" "")
  } else if ($name | str contains "/") { 
    # Format: owner/repo
    clone-and-cd $name
  } else if ($name | str contains "@") { 
    # Format: @owner
    # TODO
  } else { 
    # Format: repo name only
    # TODO
  }
}
```

## `@owner`

如果传入一个`@owner`，我们期待获得的是它的全部仓库列表，并交给用户来选择。`gh`命令行工具给我们提供了搜索的API来实现：

```bash
gh search repos --owner $owner --limit 500 --json fullName
```

我们期望以 JSON 格式输出，并至多输出 500 条。之后可以用`nushell`解析这个 JSON，并传入 fzf 中：

```nushell
# ...
else if ($name | str contains "@") { 
    # Format: @owner
    let owner = $name | str replace "@" ""
    gh search repos --owner $owner --limit 500 --json fullName
      | into string
      | from json
      | get fullName
      | to text
      | fzf --preview "gh repo view {} | glow - --style=dark" --preview-window right:70%
      | if (($in | str length) > 0) {
          clone-and-cd $in
        }
}
# ...
```

这里值得注意的是我们给 fzf 传入了一个预览窗口，显示的是仓库的 README 信息，这同样是 `gh` 命令行给我们提供的能力；将这个`markdown`传入[`glow`](https://github.com/charmbracelet/glow)，可以渲染成漂亮的格式。

## `repo`

如果传入一个纯仓库名，流程是类似的：应该先搜索这个仓库名，然后打开 fzf 交互式选择器，让用户选择。下面直接给出代码：

```nushell
# Format: repo name only
    gh search repos $name --limit 50 --json fullName
      | get fullName
      | to text
      | fzf --preview "gh repo view {} | glow - --style=dark" --preview-window right:70%
      | if (($in | str length) > 0) {
          clone-and-cd $in
        }
```

## 访问浏览器 TAB

到了最后一个功能，这其实是我突发奇想出来的：因为我经常是在浏览器上浏览一个项目，中途想克隆这个项目。能不能不复制网址，直接调用某个操作系统窗口的API，获取到当前浏览器打开的所有 GitHub 仓库页面然后让用户来选择呢？

实话说，这是一个有点强行的需求，只需复制 url 就可避免。但我采用一种取巧的方法实现了，这里给出思路供你参考。

我联想到有没有工具已经实现了读取浏览器页面的需求呢？一开始我求助了 AI，提问如下：

```
✨ 常见浏览器会向外暴露有关用户正在访问什么网页标签页的API吗？

回答：一般来说，常见浏览器（像 Chrome、Firefox、Safari、Edge）不会直接暴露用户正在访问什么网页的 API，出于隐私和安全考虑，它们专门防止网页或者扩展直接知道用户浏览了哪些其他页面。……

✨ macOS有什么API能获取到当前用户浏览器的全部标签页信息吗？

回答：macOS官方公开的API（包括Cocoa、Swift、Objective-C相关）是没有提供直接获取所有浏览器标签页信息的接口的。不过，有一些间接的方法可以做到，主要有以下几种路子：（省略具体内容）

1. 通过AppleScript + Scripting Bridge控制Safari / Chrome
2. 借助浏览器插件
3. 用Accessibility API 读窗口信息（不推荐）

```

他提示我使用 AppleScript，很快我联想到了macOS上一些使用这种脚本工作的实用工具，比如[Raycast](https://www.raycast.com)。它有一个 Arc 的插件，能返回当前标签页的信息，这正是我要的！

![raycast extension](/images/smarter-clone/screenshot.png)

我很快去翻了 Raycast 这个扩展的源码，找到了这段 [脚本](https://github.com/raycast/extensions/blob/00bd74e5e1d6f4293649ba0ac2493b851ac5eb72/extensions/arc/src/arc.ts#L6)：

```typescript
export async function getTabs() {
  const response = await runAppleScript(`
    on escape_value(this_text)
      set AppleScript's text item delimiters to "\\\\"
      set the item_list to every text item of this_text
      set AppleScript's text item delimiters to "\\\\\\\\"
      set this_text to the item_list as string
      set AppleScript's text item delimiters to "\\""
      set the item_list to every text item of this_text
      set AppleScript's text item delimiters to "\\\\\\""
      set this_text to the item_list as string
      set AppleScript's text item delimiters to ""
      return this_text
    end escape_value

    set _output to ""

    tell application "Arc"
      if (count of windows) is 0 then
        make new window
      end if

      tell first window
        set allTabs to properties of every tab
      end tell
      set tabsCount to count of allTabs
      repeat with i from 1 to tabsCount
        set _tab to item i of allTabs
        set _title to my escape_value(get title of _tab)
        set _url to get URL of _tab
        set _id to get id of _tab
        set _location to get location of _tab
          
        set _output to (_output & "{ \\"title\\": \\"" & _title & "\\", \\"url\\": \\"" & _url & "\\", \\"id\\": \\"" & _id & "\\", \\"location\\": \\"" & _location & "\\" }")
        
        if i < tabsCount then
          set _output to (_output & ",\\n")
        else
          set _output to (_output & "\\n")
        end if

      end repeat
    end tell
    
    return "[\\n" & _output & "\\n]"
  `);

  return response ? (JSON.parse(response) as Tab[]) : undefined;
}
```

事实上你不太需要看懂里面具体的语法，因为这个苹果的脚本语言非常垃圾。

只需要复制它，并在我们的脚本里复用即可：

```nushell
if $name == null {
    if not (is-macos) {
        print "❌ Not implemented on non-macOS yet."
        return
    }
    print "Currently only Arc Browser is supported."
    let script = open ~/.config/scripts/get_arc_tabs.applescript | to text  # 将其保存为脚本文件
    osascript -e $script
        | from json
        | get url
        | where $it =~ 'http[s]?\://github.com/.*'
        | each { |it| parse-url $it }
        | uniq
        | to text
        | fzf --height=~100%  # not full screen
        | if (($in | str length) > 0) {
            clone-and-cd $in
        }
}
# ...
```
成功了！我们得到了一个漂亮的交互式选择器，让用户选择一个他正在浏览的 GitHub 仓库，然后克隆它。

![screenshot2](/images/smarter-clone/screenshot2.png)

## 题外话：`degit`和`tiged`

我们把仓库克隆下来可能会有几个目的：

1. 更方便地学习和参考作者的代码；
2. 修改代码，然后提交 PR；
3. 修改代码自己用。

你会发现第一种和第三种情况下我们不太需要这个仓库的`git`信息；相反过多的`git object`可能会导致克隆的速度变得非常慢。这时候一个好用的工具[`degit`](https://github.com/Rich-Harris/degit)派上用场，它仅会下载最新的一次提交！

[这里](https://github.com/Rich-Harris/degit#wait-isnt-this-just-git-clone---depth-1) 也提到了这个工具相比`git clone --depth 1`的优点。

遗憾的是，degit 已经不再活跃；[tiged](https://github.com/tiged/tiged) 是一个社区分支，适合你现在来使用。

---

> 本文的脚本全文在 [这里](https://github.com/gaojunran/dotfiles/blob/main/dot_config/scripts/gh.nu)。

这就是本文的全部内容了，希望对你有帮助 🎉！
