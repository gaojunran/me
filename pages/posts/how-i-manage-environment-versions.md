---
title: 我如何管理多个版本的环境
date: 2025-04-24T00:00:00Z
lang: zh
duration: 8min
---

有些编程语言的环境很棒，它们几乎没有跨版本的问题，例如`Rust`, `Go`等。通常一个`cargo`就能无痛地运行起所有包和开源项目。但是另外一些语言则不同了，以下是几个环境管理比较痛苦的语言：

- `Python`。`PyPI`上的很多包会限制版本，在特定的版本范围内（如`3.9 ~ 3.12`）才能运行。

- `Node.js`。我从没开发过`npm`包，但是我经常克隆一些前端项目，遇到报错时我首先做的就是换一个`node`版本。90%的情况下问题迎刃而解，所以说明管理`node`的版本还是有必要的。

- `Java`。事实上稍新版本的 JDK / Java 已经很少有破坏性更新了，但我最近在练习微服务的项目，需要下载一个 1.8 版本的 JDK，还是有管理版本的需求。

我希望我的每个开源项目都能包含一个包含我项目环境版本的文件，它看起来像这样：

```plain
node 22.14.0
pnpm 8.6.3
```

这样克隆我项目开发的开发者就能免除版本管理的烦恼。

## [`asdf`](https://asdf-vm.com/)

很不幸，我先遇到了`asdf`。这是一个不错的多版本管理工具，亮点有很多：

- 可以管理多种语言、多种环境，依赖插件实现。
- 可兼容其它版本管理工具的文件，如`.nvmrc`等。
- 最重要地，它支持`nushell`!

`asdf`的理念也很不错（摘自[官方文档](https://asdf-vm.com/guide/introduction.html)）：

> `asdf`确保团队在使用一模一样版本的工具，它通过插件系统支持许多工具，插件系统足够简单和熟悉，你只需在你的 Shell 配置中包含一个脚本。

但是最终我还是放弃了`asdf`，它有几个**致命**的缺点：

- 它的插件体系是分布式的，很多语言的插件都散布在 GitHub 上，需要自行安装，而且质量难以保证（比如说我就给 asdf-java 提过一个 PR，至今没有被合入😔）。

- 它的命令有点不好记，我经常会犹豫是`asdf list java all`还是`asdf list all java`还是`asdf java list all`……

- 它的插件是`bash`脚本，这意味着它几乎不可能（或非常困难）在没有 WSL 的 Windows 上运行。这是难以接受的，因为我希望我的版本管理工具有着最大限度的兼容性。

所以我放弃了我折腾了几天的`asdf`，转而寻找新的解决方案。

## [`mise`](https://mise.jdx.dev/)

> 来自 asdf 的普通用户通常发现 mise 是一种更快、更易于使用的 asdf。（来自[官方文档](https://mise.jdx.dev/dev-tools/comparison-to-asdf.html)）

- 它是用 Rust 写的。虽然很多人觉得「强调一个项目是什么语言写的」这件事很愚蠢，但是 Rust 在开源社区、尤其是开发者工具这个领域，代表着**最高的质量**，这是由开发者的平均水平证明的！

- 它的功能和可配置项相比`asdf`多了非常多，且原生支持**管理版本 + 管理`.env` + 命令运行器**（我用[`just`](https://github.com/casey/just)，功能更多）。

- 它完美解决了`asdf`的问题：支持Windows、集中管理插件、人性化的命令……

接着我会从我使用的角度，来讲讲`mise`的使用。希望能对你有所帮助！

## 安装环境：`mise use`

首先可以使用各种包管理器来安装`mise`。

使用一个简单的命令`mise use`，后面加上工具名和版本，就可以下载并安装对应版本的工具，同时固定到`mise.toml`文件中。

```bash
mise use node@22.14.0 java@latest
mise exec node -- node --version  # v22.14.0
```

我们会发现，如果每次都使用`mise exec`命令来运行会显得有些繁琐，所以`mise`提供了[两种方案](https://mise.jdx.dev/dev-tools/shims.html#shims-vs-path)来让你仅输入`node`就能运行当前版本的`node`：

## 激活环境：`PATH` / `shims`

第一种方案是`PATH`，它是大多数情况下的理想答案：它会设定一系列钩子，在进入一个目录时将对应的路径加进`PATH`里，并自动管理卸载。

运行`mise help activate`，可以根据指导来将一段代码写入 Shell 的配置文件中。

以下是`nushell`的示例：

```nushell
export def "setup-once" [] {
    const MY_AUTOLOAD = "~/.config/autoload"
    # ...
    if (is-installed "mise") {
        # 目前这个激活脚本有点问题，`nushell`不允许在`use`语句中使用单独的语句设置环境变量
        # https://github.com/jdx/mise/discussions/3555
        # 暂时先把这部分删掉
        ^mise activate nu | str replace -r '\$env\.Path = \(\$env\.Path \| prepend.*\)' ""
                          | save -f ($MY_AUTOLOAD | path join "mise.nu")
    } else {
        print "⚠️ `mise` is not installed. Skip."
    }
}

use ($MY_AUTOLOAD | path join "mise.nu" | path expand)
```

第二种方案和`asdf`类似，即`shims`，它将`node`别名指向一个脚本，脚本用于选择正确的工具版本。

这种方案存在一定的[缺点](https://mise.jdx.dev/dev-tools/shims.html#shims-vs-path)，更适合脚本使用而不是交互式Shell使用，这里我就没有选择这种方案。

接着来看效果：

![效果](/images/how-i-manage-environment-versions/screenshot.png)

✨ 可以看到，我切换目录后没有执行任何命令，`cd`钩子自动帮我更改了 PATH 以切换版本，非常不错！

## 其它

`mise`还提供了管理环境变量（相当于[`direnv`](https://github.com/direnv/direnv)）和运行命令的功能。后者我主要使用[`just`](https://github.com/casey/just)，它具有更多的高级功能。

我还在探索这个好用的工具，后续如果有新发现还会持续更新！
