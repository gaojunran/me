---
title: 正式介绍我的终极Nushell配置
date: 2025-04-19T00:00:00Z
lang: zh
duration: 6min
---

我是一个实用主义的人，所以对`bash`不够满意。`powershell`是面向对象的，但是不够开发者友好。一个偶然的机会我发现了Nushell，从此一发不可收拾。

实话说，也不能说是偶然，因为我是写 Rust 的，这个极其现代和快速的、Rust语言写的 shell 很快吸引了我的眼球。

Nushell的好处可以归纳为以下三点：

- <span text-blue font-bold>快速</span>。它是 Rust 写的，你可以放心。
- <span text-emerald font-bold>现代</span>。它支持结构性数据，支持管道，支持脚本，支持插件…… **支持你能想到的任何特性，而且语法易写易懂**。
- <span text-rose font-bold>开箱即用</span>。你不需要装 Oh my zsh ，像`fish`一样安装后即可获得候选项选择、行内补全等特性。

如果你还没接触过它，可以去[官网](https://nushell.sh)看一下，相信你会喜欢上的。

## 我的几百行配置

写这玩意真的上瘾。写 Python / JavaScript 已经非常舒适了，因为它们有着简单的语法和即时的反馈。Nushell 则更进一步，不仅语法接近脚本语言，而且有着很多专属于 Shell Script 的体验，比如如果你要定义一个自定义命令，可以：

```nu
# Copy specified files / files from the clipboard, to ~/Playground/<dir>.
export def --env cvp [
    dir?: string,  # Specify a dir name. It'll be ~/Playground/<dir>.
    ...files: string # Specify files to copy. If empty, copy from clipboard.
] {
    let abs_files = $files | each { |file| $file | path expand }
    cd ~/Playground
    if ($dir != null) {
        mc $dir  # `mc`是我的另一个自定义命令，可以理解为`mkdir + cd`
    }
    if (($files | length) > 0) {
        $abs_files | each { | file | !cp $file ($file | path basename) }
    } else {
        cb paste
    }
    ls -a
}
```

这是我编写的其中一个命令，你会发现它足够简单而且易懂，可选参数和变长参数的语法也很直观。而且离谱的是，nushell 居然会把你写在脚本中的**注释**转换成**帮助信息**：

![help](/images/nushell-introduce/help.png)

你可以在[这里](https://github.com/gaojunran/dotfiles)看到我的所有配置。后续我可能还会录一个视频讲讲这些有意思的配置！

## 怎么同步配置呢？

我有两个电脑，一个Windows一个Mac（这很痛苦了😭），这意味着我不仅需要同步配置，还需要尽量保证我的脚本在 Windows、MacOS 和 Linux 平台上都是可用的。

经过一些挑选之后，我选中了[chezmoi](https://github.com/twpayne/chezmoi)这个工具，它可以将寄存在 Github 上的配置仓库同步到你的新设备上。

如果你很信任我，可以直接使用我的配置！安装`chezmoi`和`nushell`后直接运行：

```bash
chezmoi init --apply gaojunran
```

我已经在我室友的崭新电脑上测试过了，应该可以开箱即用，希望你能喜欢！
