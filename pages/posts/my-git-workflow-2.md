---
title: 我的 Git 工作流（2）
date: 2025-04-26T00:00:00Z
lang: zh
duration: 15min
---

> [前文](/posts/my-git-workflow)介绍了三种 Git 工作流模型，本文介绍一些补充内容和我对我 Git 脚本的改进。

> 本文的所有脚本都是`nushell`脚本，后续我会在有时间的时候改写成其它更大众的语言。当然如果你看懂了原理，也可以自己实现一下！

在开始之前，请先安装好 [tldr](https://tldr.sh/)（或访问其在线页面），它以**简短的语言和具体的例子**给众多命令行工具（包括`git`在内）提供帮助，非常好用！！！

## `Status`

Git 的原生命令`git status --porcelain`能提供如下格式的输出：

```
A  1.txt
 M 3.txt
?? 2.txt
```

我们能发现左面是状态，右面是文件名。左面的状态都是用两个符号表示的：

第一个符号表示在「暂存区」中的状态（例如`1.txt`就是刚刚加入暂存区中的文件）；

第二个符号表示在「工作区」中的状态（例如`3.txt`就是被修改过、但还未加入暂存区中的文件）。

如果文件尚未被追踪（例如`2.txt`），则两个符号都是`??`。

我需要写一个函数以便后续使用，签名如下：

```nushell
def git-status [
  --only-staged (-s)
  --only-unstaged (-u)
] { ... }
```

有两个可选的参数，用于指定只显示「暂存区」中的文件或「工作区」中的文件。

怎么实现呢？这里我们很轻易地想到**正则表达式**是最简单的实现方法。前面提到的`git status --porcelain`的输出是有固定格式的，前两位固定是状态，用一个空格分隔后，接着的是文件路径：

```nushell
git status --porcelain | lines | parse --regex '(?P<status>.{2})\s(?P<file>.*)'
```

使用`lines`将输出按行分割，然后使用`parse`进行字段的解析。这里我们可以使用**命名捕获组**，**将解析出来的组映射到表格的列字段上**，非常的实用。

如果指定了只输出未暂存的文件，则其状态应该是**第一位字符为空、第二位字符不为空**或`??`（未追踪），所以可以这样写：

```nushell
... | where $it.status =~ '^ [^ ]|^\?\?'
```

`where` 类似于 SQL 中的`WHERE`或是函数式编程中的`filter`，用于筛选出符合条件的行；`nushell`中`where`自带一个参数`it`用于表示当前行，`=~`表示按正则匹配，返回一个布尔值。正则匹配第一位字符为空、第二位字符不为空；或均为`?`的状态。

完整实现如下：

```nushell
export def git-status [
  --only-staged (-s)  # ONLY show tracked files
  --only-unstaged (-u)  # ONLY show untracked files
] {
  if ($only_staged) {
    git-status | where $it.status !~ '^ [^ ]|^\?\?'
  } else if ($only_unstaged) {
    git-status | where $it.status =~ '^ [^ ]|^\?\?'
  } else {
    git status --porcelain | lines | parse --regex '(?P<status>.{2})\s(?P<file>.*)'
  }
}
```

## `Stage`, `Switch`

在我之前版本的脚本里，都是直接将所有工作区的文件都加入暂存区，即`git add .`。但我在实际使用中发现，通常有些文件是想**稍后再提交**的，就不该放进暂存区。所以有一个交互式选择`stage`的功能会更方便一些。

要编写一个这样的功能，首先就可以复用`git-status --only-unstaged`来列出所有未暂存的文件。

接着我们需要一个交互式选择器！这里我使用 [fzf](https://github.com/junegunn/fzf)，一个模糊查找器。

先看代码：

```nushell
export def stage-interactive [] {
  git-status --only-unstaged
      | get file
      | if (($in | length) > 0) {
        to text
        | fzf -m --preview 'output=$(git diff --color=always -- {}); [ -n "$output" ] && echo "$output" || cat {}' --bind 'pgup:preview-page-up' --bind 'pgdn:preview-page-down' --bind 'ctrl-a:select-all+accept'
        | lines
        | each { |it| git add $it; print $"📢 Staged ($it)" }
        | ignore
      } else { print "📢 No unstaged changes!" }
}
```

聚焦`fzf`的使用这行，我们给`fzf`传递了几个参数：

- `-m`：多选模式，可以同时选择多个项；
- `--preview`：预览模式。这里使用了一个命令`git diff --color=always -- {}`来显示文件差异（`{}`会被 fzf 替换成当前悬停的文件），如果文件差异为空，则显示文件内容；这段`bash`脚本可能不太好理解，有一个伪代码供你参考：

```python
output = cmd("git diff --color=always -- {}")  # 执行命令，获得输出
if output != "":
  print(output)
else: # 输出为空说明未追踪
  cmd("cat {}")
```

- `--bind`：绑定快捷键。这里绑定了`pgup`和`pgdn`，用于在预览模式下上下翻页；还有`ctrl-a`，用于全选。

还有一个与之对应的函数`unstage-interactive`，用于将暂存区的文件取消暂存。代码比较类似就不再赘述了。

说句题外话，我们这里的交互做得已经不错了，甚至考虑到了`untracked`文件不会在`git diff`中展示的情况；但是 TUI 或者 GUI 工具的交互体验还是要比我们的小脚本好得多。这里我重点推荐 [lazygit](https://github.com/jesseduffield/lazygit) 和 Intellij IDEA 上自带的 Git 工具，在交互上都做得非常优秀。

所以写脚本的最大目的还是熟悉`git`命令本身。在编写这个函数的时候，我对于`git diff`会展示什么内容有疑问，通过`tldr git diff`查看帮助解决了。这个`tldr`确实很实用！

## `Stash`

工作区或暂存区中如果有更改，会影响我们检出到其它分支。这时我们有三种方案：

- `commit`。直接提交上去。
- `stash`。把更改暂存起来。
- `discard`。把更改丢弃掉。

这三种方案取决于你具体的需求，没有哪个更好之分；如果你目前的修改还没有到（你认为的）提交的条件，就可以先暂存起来；等回到这个分支再来处理。

多数时候我们希望**把更改暂存起来 -> 切换到其它分支 -> 等回到原分支再恢复暂存**，这是一个非常常见的操作，所以我们可以写一个`smart-switch`函数来增强我们的切换分支功能！

> Intellij IDEA 有这个功能，叫智能检出（Smart Checkout）。

以从`dev`分支切换到`main`分支为例。在检出分支前如果当前工作区有更改，就暂存起来。暂存时可以携带一个信息`STASH-dev`表示这是`dev`分支上的修改：

```bash
git stash push -u -m STASH-dev # `-u`表示包括未追踪的文件
```

这样我们下次回到`dev`分支时就可以在`stash`存储（是一个栈模型）中找到信息为`STASH-dev`的记录并弹出：

```nushell
let ref = git stash list --grep="STASH-dev" --format="%gd"
# 找到名为 STASH-dev 的`stash`条目，并返回引用
git stash pop ($ref) # 弹出这条，并应用于当前分支
```

另外，如果没有给`smart-switch`函数传递参数，则启动一个交互式选择器来选择分支：

```nushell
git branch
| lines | to text
| fzf
| str replace -r '^[\*|\s]{2}' '' # 替换掉前面的星号。可以使用`git branch`来看下格式
| if ($in == "") { return } else { $in }  # 如果fzf直接退出，则直接退出此函数
```

完整代码考虑了一些边界情况，有点长，如下：

```nushell
export def smart-switch [
  target?: string # invoke a interactive chooser if not provided
] {
  let source = (current-branch)
  let target =  ($target | default (git branch
        | lines | to text
        | fzf
        | str replace -r '^[\*|\s]{2}' ''
        | if ($in == "") { return } else { $in }
  ))
  if not (has-branch $target) {
    input $"📢 Create `($target)` branch from `($source)`? (y/n/<from which branch>): " | if ($in == "y") {
      git branch $target
    } else if ($in == "n") {
      return
    } else {
      git branch $target ($in)
    }
  }
  if ($source == $target) {
    print $"📢 Already on branch ($target)"
    return
  }
  if not (is-clean) {
    print "📢 Stashing changes..."
    git stash -u -m $"STASH-($source)"
  }
  git switch $target
  let msg = $"STASH-($target)"
  let ref = git stash list --grep=($msg) --format="%gd"
  if $ref != "" {
    print "📢 Unstashing changes..."
    git stash pop ($ref)
  }
}
```

接着我们就可以将之前编写的很多函数的「切换分支」改成使用这个函数了！

## `Discard`

前面我们提到了直接丢弃掉当前工作区和暂存区的更改也是一种方案。这里我们就来实现一下交互式丢弃文件的更改：

```nushell
export def discard-interactive [] {
  git-status
      | get file
      | if (($in | length) > 0) {
        to text
        | fzf -m --preview 'output=$(git diff HEAD --color=always -- {}); [ -n "$output" ] && echo "$output" || cat {}' --bind 'pgup:preview-page-up' --bind 'pgdn:preview-page-down' --bind 'ctrl-a:select-all+accept'
        | lines
        | each { |it|
          let output = git restore --source=HEAD --worktree --staged $it | complete
          if ($output.exit_code != 0) { # untracked
            rm -rf $it
            print $"📢 Deleted ($it)"
          } else {
            print $"📢 Discarded ($it)"
          }
        }
        | ignore
      } else { print "📢 No unstaged changes!" }
}
```

使用`git restore --worktree`来丢弃工作区的更改，使用`git restore --staged`来丢弃暂存区的更改。两个参数都加上表示同时丢弃这两个区的更改。（可以使用`tldr git restore`了解到）

特别地，如果文件未被追踪，`git restore`则无法处理，就应当直接删除此文件。

再次提醒，这是一个危险操作，只有你明确了你不想要这个修改/文件，才应当使用。

## `Sync`, `Integrate`, `Reset`

这篇[博客](https://matklad.github.io/2018/05/03/effective-pull-requests.html)中，有很多与我们这两篇博文相似的指导。有一些值得我们借鉴：

在上篇博文中我们提到，必须新建一个特性分支来进行PR。但是我们可能经常会忘记新建分支，克隆了仓库之后就开始在主分支上写代码了！

有一种补救的方式。我们上篇文章中编写了`integrate`函数，用来将其它分支的更改合入主分支（是**其它分支比主分支更新**）。现在是**主分支比其它分支更新**，是一个截然相反的情况，可以改进一下`integrate`和`sync`来支持这种情况：

```nushell
# Sync latest changes from main branch (by default, or specified branch) and corporate into current branch.
# Now current branch is: latest source branch -> current branch changes.
# After this command, you may want to push current branch and open a pull request.
export def sync [
  branch?: string
] {
  let target = (current-branch)
  let source = $branch | default (master-or-main)
  if ($source == $target) {
    print "❌ Source branch and target branch are the same. Switch to another branch first."
    return
  }
  # Sync remote fork from its parent.
  print "🚀 Syncing your fork from its upstream..."
  let res = gh repo sync (git remote get-url origin) | complete
  if ($res.exit_code != 0) {
    print "📢 This repo is not a fork. Skip."
  } else {
    print $res.stdout
  }
  # Update main branch from origin.
  print $"🚀 Updating ($source) branch from origin..."
  smart-switch $source
  git pull --rebase origin $source
  # Apply changes onto current branch.
  print $"🚀 Applying ($source) changes onto ($target)..."
  smart-switch $target
  git rebase $source
}

# Simply integrate current branch into main branch (by default, or specified branch) using fast-forward merge.
# After this command, you may want to push both branches to remote.
export def integrate [
  branch?: string
] {
  let source = (current-branch)
  let target = $branch | default (master-or-main)
  if ($source == $target) {
    print "❌ Source branch and target branch are the same. Switch to another branch first."
    return
  }
  sync
  print $"🚀 Integrating ($source) branch into ($target) branch..."
  git switch $target
  git merge $source --ff-only
}
```

再补充一个`reset`函数，用于撤回指定数量的提交：

```nushell
export def reset [
  count?: int = 1,
  --hard (-h)  # Hard reset
] {
  if ($hard) {
    git reset --hard ("HEAD~" + ($count | into string))
  } else {
    git reset --mixed ("HEAD~" + ($count | into string))
  }
}
```

`--mixed`能把提交撤回到工作区；`--soft`能把提交撤回到暂存区；`--hard`会丢弃这些提交（事实上你也能找回来，但是非常麻烦，属于危险操作）。

假设我们本应该在`dev`分支上写代码，但在`main`分支上写了！可以执行：

```nushell
# on main branch
integrate dev
# on dev branch
smart-switch main
# on main branch
reset -h 1  # 假设只有一个新提交，将`main`分支的更改回撤到工作区中
```

你会发现我们之前编写的函数名都挺长的，这是为了让函数的语义更清晰。你可以很轻易地编写一些别名让输入命令时更爽。

---

这是我写过最长的一篇博文了。你会发现我们写的很多函数之间都是可以互相复用的，实用性也很强。你也可以学着我的思路编写一些其他脚本。

你可以在[这里](https://github.com/gaojunran/dotfiles/blob/main/dot_config/scripts/git.nu)看到我的全部脚本，希望能对你有所帮助！
