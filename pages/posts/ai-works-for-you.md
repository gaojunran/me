---
title: 让 AI 为你打工的正确方式
date: 2025-04-22T00:00:00Z
lang: zh
duration: 12min
---

[[toc]]

我接触大模型（LLM）其实相当早，在 ChatGPT 爆火的第二天我就上手试了。当时是让它来写高中英语的读后续写作文题，质量让我非常震惊。

在此之前，我从未想过有一种人工智能能成为通用助理，在任何领域都能给出及格线以上的答案。

这篇文章我们主要聚焦于编程领域，聊聊我这几年来积累的和大模型对话的经验。

---

首先我们来讨论一下AI能力的短板。

## <span text-rose-3> AI 本身没有直接运行代码的能力 </span>

如果你把一个有 bug 的代码提供给大模型，在不借助 MCP 的情况下，**AI没有对你代码插桩调试的能力**。不要苛责 AI，让 AI 对着你的代码干瞪眼睛看，和让你去用纸笔写代码是同样的难度。

[智谱清言](https://chatglm.cn/)曾经有运行Python代码、提供结果或修正回复的能力。这可以说是一个早期的MCP，是真正实现 [Vibe Coding](https://zhuanlan.zhihu.com/p/32476516386) 所必需的。一个比较理想的状态是，AI 在为用户生成代码后，启动一个沙箱来运行或调试代码，从而根据结果/报错来动态调整自己的回复。

短期内这种模式不太容易实现，因为它太消耗 token 和服务器资源。现在已经有了可部署在本地的类似项目，可以去尝试一下。

还有另一种解决方案，就是改进你的提示词，让AI获得更多和代码运行结果相关的上下文信息，会在后面讲到。

## <span text-rose-3>AI 会在你的代码上打补丁</span>

这里我们给一个具体的例子：

```js
function calculateSum(numbers) {
  let sum = 0
  for (let i = 0; i <= numbers.length; i++) {
    sum += numbers[i]
  }
  return sum
}

console.log(calculateSum([1, 2, 3, 4]))
```

这段代码不可能是 AI 生成的，因为它不可能犯这么简单的错误。循环终止条件`i <= numbers.length`导致了数组越界，访问到`undefined`而报错。

如果你拿给AI修改这段简单的代码，AI可能会给你改对。更常见的情况是，当代码更为复杂时，AI 会根据你的异常情况给出这样的结果：

```js
function calculateSum(numbers) {
  let sum = 0
  for (let i = 0; i <= numbers.length; i++) {
    if (numbers[i] !== undefined) { // [!code highlight]
      sum += numbers[i]
    } // [!code highlight]
  }
  return sum
}

console.log(calculateSum([1, 2, 3, 4]))
```

这种情况大家肯定遇到过。核心原因是，AI是 **解决问题导向** 的（Solving-oriented）。AI 会以代码顺利运行出正确结果为第一目标，代码的可维护性等方面则位居其后。

当然，没有什么是提示词不能解决的，后面我们会提到如何规避这种情况。

## <span text-rose-3>越长的回答，质量越差</span>

现在的 [cursor](https://www.cursor.com/)、[v0.dev](https://www.v0.dev) 这些全项目感知的AI编程工具其实没有什么特别的，经过我的实际使用，它们在对原来的代码进行修改时都是先让大模型输出要修改的代码全文，然后在前端展示时用`git diff`这种形式来营造「AI只是做了修改」这个假象。

这会导致AI输出的内容相当长，非常浪费 token ，而且也会让回答的质量降低。

所以我现在还是愿意用网页版的问答式的AI，我可以让它「只输出关键部分的代码」，可以有选择性地整合进我的代码里，从而不至于让自己变成只会打字提需求的产品经理。

代码会随着你的每次提问逐渐熵增。如果你想对 AI 生成的代码有一定的掌控力，一定要在早期就充分理解 AI 为你生成的代码，否则到了后期 AI 和你自己都看不懂的时候就很痛苦了。

## <span text-rose-3>过时的API、小众的工具</span>

AI 的知识只会截止到他被训练的时间。当然现在的AI都有联网搜索，但是互联网上也有过时的信息。这会导致过时的 API 、不推荐但常见的写法充斥在AI生成的代码中。

还有一些 AI 在被训练时没有涵盖在内的小众工具，比如如果你想配置一些命令行工具，AI可能给不出比较好的答案。

---

前面提到了这么多 AI 的短板，现在是时候聊聊如何规避这些问题，让 AI 生成一次性可用的代码了。

## <span text-emerald-3> 给 AI 提供充足的上下文 </span>

当你要让AI修改一个相对复杂的代码项目时，应该尽量多地给 AI 提供以下上下文信息：

- **项目的整体结构和出错代码的位置。** 例如`我正在编写一个类似 sed 的命令行工具，现在代码在逐行阅读文件系统中文件时报错，在 readline.rs 中。`

- **报错信息或错误输出。** 例如`Error: "Failed to open file" in file.rs: line 10`。

- **出错代码的上下文。** 上下文的长度取决于你对代码的认识程度，通常来说你对代码越不了解、越难定位出错代码的位置、越需要给AI提供尽量多的上下文；但与此同时，AI 分析问题的困难程度也会加大（详见下一条）。所以我还是秉持一个观点，AI 不会让程序员这个行业消失，会写代码的人使用 AI 的效率是不会写代码的人的2 ~ 3倍，因为他们懂得如何提问，是一个靠谱的产品经理。

还有额外的一点需要注意，报错信息中通常会给出代码出错的行号，而 LLM 在计数方面有劣势，不一定会查数，如果你发现 AI 没能在你给提供的代码中定位到问题所在行，你可以用一个箭头指一下：

```js
function calculateSum(numbers) {
  let sum = 0
  for (let i = 0; i <= numbers.length; i++) {
    sum += numbers[i]
  }
  return sum
}

console.log(calculateSum([1, 2, 3, 4])) // <- 这行的预期输出是10，与预期输出不符
```

- **插桩调试代码的中间结果。** 这个会在下一条中展开来讲。

## <span text-emerald-3> 给 AI 提供「最小重现」 </span>

上下文越复杂，AI找问题的效率越低。这个现象在人身上也成立，Anthony Fu老师曾经发过一篇文章讲「[为什么要提供最小重现](https://antfu.me/posts/why-reproductions-are-required-zh)」。GitHub 开源项目也经常要求提 Issue 的用户提供最小重现。

这意味着，你提供给 AI 的代码应该尽量简洁，只包含和问题直接相关的部分，去除无用的部分。这样 AI 就能更快地定位问题，并且更容易地给出解决方案。与此同时，你在制作重现的时候，也可能会直接发现问题所在，甚至不需要再去求助 AI。

AI 在现阶段只会被动地接受你的提示词，还没有主动修改代码、调试代码、制作最小重现的能力。我发现 ChatGPT 经常会指导你去将代码拆分成几个部分，逐一进行调试从而定位出问题的位置，这是一种很不错的编程实践。

## <span text-emerald-3> 给 AI 提供它知识以外的信息 </span>

当你使用较新的技术、框架或工具时，你可以明确要求 AI 开启「**联网搜索**」，AI 会从几十个网页中总结结果，给出一个相对准确的答案。这在你配置环境时遇到问题时非常有用。

而对于一些小众的软件，通常我们想要给 AI 提供它的文档全文。怎么提供呢？这里有一个很有趣的解决方案：

有一个命令行工具 [repomix](https://github.com/yamadashy/repomix) 可以将一个仓库打包成一个文本文件，从而方便你去作为附件提供给 AI。通常来说开源项目的文档都是以`md`或`mdx`文档的形式寄存在GitHub上的，你可以充分使用这个软件来提取一个开源项目的文档并喂给 AI。这里有一个实际的例子，我们把Typst的文档打包成一个文件：

```bash
repomix --remote typst/typst --include docs --output typst.md
```

这会生成一个可以直接提供给AI的文件，并在命令行展示：

```
📦 Repomix v0.3.2

Clone repository: https://github.com/typst/typst.git to temporary directory. path: /var/folders/81/w3gxl5ts4_s5lwwz3w01bv200000gn/T/repomix-3jtTfS

✔ Repository cloned successfully!

No custom config found at repomix.config.json or global config at /Users/nebula/.config/repomix/repomix.config.json.
You can add a config file for additional settings. Please check https://github.com/yamadashy/repomix for more information.
✔ Packing completed successfully!

📈 Top 5 Files by Character Count and Token Count:
──────────────────────────────────────────────────
1.  docs/guides/tables.md (52,936 chars, 14,360 tokens)
2.  docs/src/lib.rs (28,835 chars, 6,851 tokens)
3.  docs/guides/guide-for-latex-users.md (28,104 chars, 7,027 tokens)
4.  docs/changelog/0.12.0.md (21,197 chars, 5,174 tokens)
5.  docs/changelog/0.13.0.md (17,585 chars, 4,368 tokens)

🔎 Security Check:
──────────────────
✔ No suspicious files detected.

📊 Pack Summary:
────────────────
  Total Files: 54 files
  Total Chars: 412,268 chars
 Total Tokens: 102,809 tokens
       Output: typst.md
     Security: ✔ No suspicious files detected

🎉 All Done!
Your repository has been successfully packed.

💡 Repomix is now available in your browser! Try it at https://repomix.com
```

我也写了一个 Nushell 脚本，方便在终端使用：[这里](https://github.com/gaojunran/dotfiles/blob/main/dot_config/scripts/repomix.nu)。

---

最后要提到的是，AI 在目前依然没有一次性写对代码的能力，这需要你有着足够的耐心和 token 去反复提问让 AI 改进，同时一定要对代码保持自己的思考：**AI 只是打工人，而你才是对这些代码负责任的人，AI 不会取代你**！

希望这篇文章能对你有所帮助！

这篇文章中没有提到 MCP ，因为我还没有抽出时间来仔细了解。但是MCP一定会颠覆AI编程的逻辑，甚至推翻很多我这篇文章中提到的内容（比如MCP会给AI提供运行代码的能力）。等我研究完之后，会再发一篇文章讲讲 MCP。
