---
title: node 替代品大战：deno VS bun
date: 2025-12-01T00:00:00Z
lang: zh
duration: 3min
---

> 请关注这篇文章的发布时间。现在 Bun 的版本是 1.3，deno 的版本是 2.5.6；两个项目都发展很快，这篇文章可能很快会过时。

[deno](https://deno.com/) 是一个有趣的 JavaScript 运行时。和我们经常使用的 node 不同，它自带包管理器、直接支持运行 TS，而且是默认安全的。与它类似的项目还有 [bun](https://bun.com)，这两家都是商业公司，现在发展的速度类似。

在经过了几个月的尝鲜之后，我得出了一些结论，仅供你来参考：

1. bun 装包的速度是最快的，极其适合作为前端项目的包管理器（替代 npm/pnpm）。

> bun 和 deno 既是包管理器，也是运行时。
>
> 默认情况下，你可以选择只用 bun 或 deno 作为包管理器管理 `package.json` 和 `node_modules`，而使用任何运行时。

2. 在对 node 的兼容性上，bun 和 deno 目前差不多。如果你的工作中包含历史悠久的 CommonJs 或者不太现代的 npm 包，那么 bun 更适合一些。你需要加一堆 flags 或者配置以在 deno 中顺利运行。

3. 对于稳定的前端项目，现在不建议使用 deno 或 bun 作为运行时，它们可能都会有各种各样的问题（就像高版本 Node 一样），建议固定 Node 22 作为运行时。

4. 在 VS Code 中使用 deno 和 bun 的体验差不多。deno 的插件是必要的，而 bun 的插件是非必要的。但 bun 必须运行 `bun init` 来初始化项目，并安装例如 `@types/bun` 等类型来访问 `Bun` 命名空间。deno必须要安装插件来访问 `Deno` 命名空间。

5. 基于上一条，在其它编辑器中，bun 的体验更好，因为它完美兼容 npm 生态，不需要安装插件。

6. 作为运行时，bun 和 deno 我都遇到过 bug，两个社区解决问题的速度都很迅速，现在 deno 的 bug 相对更少些。

7. 作为运行时，bun 由 Zig/JSCore 驱动，deno 由 Rust/V8 驱动。bun 的一个显著优势是大多情况下性能更好；在启动时间上 bun 占优势，而在用户态 JS 的长任务上，deno 占优势。

> 有趣的是，虽然启动时间上 bun 占优势，但目前 deno 比 bun 更受无服务器市场的欢迎。

8. 在编写小脚本的领域，bun 和 deno 都显著强于 node。bun 和 deno 都支持在不编写依赖文件（`package.json` 或 `deno.json`）且不在当前目录中创建 `node_modules` 文件夹的情况下直接运行一个 TypeScript 文件，但是 bun 的[代价](https://bun.com/docs/runtime/auto-install#limitations)是失去编辑器的 IntelliSense；deno 则是必须安装插件才能获得 IntelliSense。

9. 目前 deno 比较擅长编写小脚本，因为它有远程模块导入语法；而且没有上一条所述的限制。deno 还支持 [JSR](https://jsr.io/)，这是一个理想的 ESM + TS 的包注册平台。此外 deno 的 [dax](https://github.com/dsherret/dax)（也适配 node/bun）非常好用！

10. bun 的 [Elysia](https://elysiajs.com) 是一个非常优秀且完善的后端框架（也适配 node/deno，但速度更慢）；bun 提供了更多对后端有用的原生 API（尽管现在都有些简陋），如 S3、Postgres 等。

11. 从编写后端的角度，[deno deploy](https://deno.com/deploy) 有点类似于 Cloudflare Worker，但没有私有 API，可以运行标准 Web 语法。可以去了解和尝试一下！基于其设计理念，Deno Deploy 目前不适合运行长时间任务或定时任务，而且有较长的冷启动时间。

现在两个包管理器/运行时不分伯仲，也不是一定要比出高下。 我大致总结出了几个使用场景供你参考：

- 使用 bun 作为兼容 npm 的包管理器。
- 使用 bun 及其丰富的原生 API 编写小型后端。
- 使用 deno 编写跨平台、无需 `package.json` 的 Shell 脚本。
- 使用 deno 编写无服务器后端。
- 在重视稳定性、兼容性的情况下、或与多人协作的项目中，使用 node，并固定版本。
- 如果你希望你的项目能在 node/deno/bun 之间无缝切换（例如 npm 库），请使用 node 或 bun，或使用 `--node-modules-dir=auto` 模式下的 deno。
- 不论使用 JavaScript 生态编写前端还是后端，不论使用什么运行时，ESM + TypeScript + 标准 Web API 都是一个绝对正确的选择。
