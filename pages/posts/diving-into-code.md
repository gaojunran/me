---
title: 一直潜入代码深处
date: 2025-06-08T00:00:00Z
lang: zh
duration: 8min
---

最近在干两件事，一个是**学习蒋炎岩老师的[操作系统原理](https://jyywiki.cn/OS/2025/)课**，一个是**持续学习 Rust**。学校的课程中简略地讲了进程、线程、并发这些操作系统中的基础概念，但并没有深入地探讨。学习了 Rust 这个深入底层的编程语言之后，我对操作系统中的概念更加熟悉了。

> 这篇文章会从一些你可能没有留意过的细节出发，带你潜入代码的深处，对自己的编程能力进行一次全面的审视。

## 程序在「地基」上运行

没有人是从零开始编写程序的。我们都是在地基之上进行代码的开发，而地基的高低很大程度上取决于你编写程序的**抽象程度**。越底层的代码依赖越少，例如你为一个新生的编程语言编写 `Socket` 库，你需要依赖的有：

- 操作系统的 Socket 接口（系统调用）；
- C 标准接口。这是对系统调用的封装，以函数的形式提供。对于新生语言的开发者来说，应该使用 FFI 来调用这些函数，以进一步封装成更高级的 API。

这是你编写的库的**能力边界**！你无法脱离这些地基，实现超出地基能力范围之外的功能。你实现的库是对这些接口的封装（组合、嵌套、抽象）。

例如我们是 Rust 的开发者，首先应该在 Rust 中声明这些函数：

```rust
extern "C" {
    fn tcp_connect(ip: *const c_char, port: c_int) -> c_int;
    fn tcp_send(sock: c_int, data: *const c_char) -> c_int;
    fn tcp_recv(sock: c_int, buf: *mut c_char, buflen: c_int) -> c_int;
    fn tcp_close(sock: c_int);
}
```

这使用了 FFI，使得我们可以在 Rust 中调用 C 的函数。然后我们再在 Rust 中进行一个封装：

<AiResult provider="grok" title="Rust 如何实现 FFI？" url="https://grok.com/share/c2hhcmQtMg%3D%3D_af32527c-8386-402a-9487-70025c9b120c" />

```rust
pub struct TcpSocket {
    sock: c_int,
}

impl TcpSocket {
    pub fn connect(ip: &str, port: i32) -> io::Result<Self> {
        let c_ip = CString::new(ip).map_err(|_| Error::new(ErrorKind::InvalidInput, "Invalid IP"))?;
        let sock = unsafe { tcp_connect(c_ip.as_ptr(), port as c_int) };
        if sock < 0 {
            Err(Error::new(ErrorKind::ConnectionRefused, "connect failed"))
        } else {
            Ok(Self { sock })
        }
    }

    pub fn send(&mut self, data: &str) -> io::Result<usize> {
        let c_data = CString::new(data).map_err(|_| Error::new(ErrorKind::InvalidInput, "Invalid data"))?;
        let n = unsafe { tcp_send(self.sock, c_data.as_ptr()) };
        if n < 0 {
            Err(Error::new(ErrorKind::BrokenPipe, "send failed"))
        } else {
            Ok(n as usize)
        }
    }

    pub fn recv(&mut self, max_len: usize) -> io::Result<String> {
        let mut buf = vec![0u8; max_len];
        let n = unsafe {
            tcp_recv(
                self.sock,
                buf.as_mut_ptr() as *mut c_char,
                max_len as c_int,
            )
        };
        if n < 0 {
            Err(Error::new(ErrorKind::UnexpectedEof, "recv failed"))
        } else {
            let valid = &buf[..n as usize];
            Ok(String::from_utf8_lossy(valid).to_string())
        }
    }
）
    pub fn close(&mut self) {
        unsafe { tcp_close(self.sock) };
    }
}

impl Drop for TcpSocket {
    fn drop(&mut self) {
        self.close();
    }
}
```

在具体实现中，我们在函数内部调用了 C 的函数，并进行了 Rust 风格的错误处理。如果函数有返回值，应该返回 Rust 的数据类型以和其他代码保持一致。

---

接着思考，如果你编写的是一个 Python 应用程序，需要的「地基」有哪些呢？**CPython 程序、Python 标准库和第三方库**。很多 Python 开发者不知道他们使用的「Python 解释器」其实是一个 C 程序，负责将 Python 源代码翻译成字节码（一种中间表示），再一行一行地解释执行。


而对于 Python 的第三方库来说，其「地基」除了标准库之外，还有 FFI，将其他语言编写的库/接口，封装为 Python 可调用的模块，使得 Python 用户可以像使用普通模块一样调用这些高性能代码。


> [pybind11](https://github.com/pybind/pybind11) 是一个将 C++ 代码封装为 Python 模块的库；[PyO3 + maturin](https://github.com/PyO3/maturin) 是将 Rust 代码封装为 Python 模块的库。

<AiResult provider="chatgpt" title="如何使用 PyO3 + maturin 为 Python 编写一个高性能模块？" url="https://chatgpt.com/share/6845b7da-04e8-8010-a5e7-85265040c20c" />


所以我们有编写一个 Python 程序的「地基」：

```
系统调用 -> 系统调用的函数接口 -> CPython -> Python 标准库 + FFI -> 第三方库
```

而编写一个 Rust 程序的「地基」：

```
系统调用 -> 系统调用的函数接口 -> Rust 标准库 + FFI -> 第三方库
```

Rust 已经足够快了，为什么还要使用 FFI 呢？这是因为 FFI 允许复用世界上已有的大量成熟、高效、经过多年打磨的 C/C++ 库（如 OpenSSL、SQLite、libpng、zlib、TensorFlow 等）；或是在更为底层的场景（驱动开发、系统内核、操作系统）中使用 Rust 与这些硬件进行交互。

对于 Python 这种抽象程度高的语言来说，其「地基」是非常高的。应用程序开发者很少能关注到系统调用的层面。而 Rust 这种相对底层的语言则明确鼓励安全地封装系统接口。

---

说完了地基，我们再来说一下程序。在操作系统上层，我们编写的代码产出成果可以分为两类：**程序**和**库**。程序有一个明确的**入口**，指定了程序的执行流程。对于编译型语言来说，入口是 `main` 函数；对于解释型语言来说，入口是解释器。库则没有明确的入口，它只是提供了一些函数、类、接口，供其他程序调用。

很多新手开发者会误解，使用 npm、pip 只能安装库，不能安装程序。事实上程序也是可以安装的。如果使用全局安装，甚至可以在任意项目中使用这个程序。

程序一旦运行起来，就成为了一个**进程**。进程是操作系统进行资源分配的基本单位。进程有**独立的内存空间**，进程之间无法直接访问对方的内存空间；进程有**独立的执行流程**，进程之间无法直接访问对方的执行流程。

如果你对进程、线程、并发、同步、互斥等概念感兴趣并致力于学习**系统编程**，可以听一下蒋老师的[《操作系统原理》](https://jyywiki.cn/OS/2025/)课。

---

## 程序是基于「源代码」的产出

许多时候，文档并不能覆盖所有行为细节，Issue 区也只是讨论结果的冰山一角。真正能揭示「程序为何如此运行」的，是那一行行写在源码里的逻辑。读源代码，不只是排错，更是了解架构、学习设计思路的最佳途径。

明确了程序完全基于源代码之后，你会顿悟：也许你之前从来没有尝试阅读过一个极大的开源项目的代码（如 Linux、FFMpeg 等），但这是开源项目最值得珍惜的地方：它不仅是一个可用的工具，更是一本打开的书。只要愿意，你可以看到它的全部思路，甚至参与其中。

大型项目都具有比较弱的耦合性，模块之间互相独立且有着明确的职责划分。你可以只阅读大型项目中你感兴趣或关注的模块，而不必从头到尾阅读整个项目。如果你不确定命令行工具该如何传参，可以从程序的**入口代码**开始阅读，找到命令行参数解析的代码，再逐步向上阅读。现在也有 [DeepWiki](https://deepwiki.com/) 这样的工具，能帮你快速定位到代码中的关键部分，另外还推荐 [Source Graph](https://sourcegraph.com/) 用于查找代码间的引用关系。

作为一个使用程序的用户，遇到问题应该怎么办呢？

- 对于大型项目，查找源代码应该是无可奈何之后的最终手段，而不是首选。大型项目都具有完善的**官方文档**和庞大的用户群，**GitHub Issue** 区很有可能已经有人遇到并解决了类似的问题。在谷歌中搜索报错的关键部分，Stack OverFlow 等问答类社区也可能会给你答案。
- 对于小型项目，查找源代码是一个可以优先考虑的方案。如果你很熟悉该项目使用的编程语言和技术栈，有能力快速定位到问题对应的代码，再结合大模型分析，就可以找到解决方案。值得注意的是，在你通过源代码找到了解决方案后，应该将解决方案分享到 Issue 区或者发起 PR 贡献代码/文档，帮助其他开发者避免踩坑。
- 如果你的问题与**实现细节**高度相关，那么查找源代码就是你的首选方案。因为文档主要面向使用者，多数使用者并不关心实现细节（对于一个应用程序而言，他们甚至不关心是用什么编程语言编写的）。

作为编写程序的开发者，如果出了报错，你首先要站在「地基」的视角来审视这个报错：

* 它是系统调用的报错吗？（例如 `File Not Found`、`Permission Denied`、`Connection Refused` 等）
  如果是，这通常意味着你的程序与操作系统之间的交互出了问题。此类错误往往源自外部环境，例如文件路径不存在、访问权限不足、目标主机未开启对应端口等。应优先检查你的输入参数、运行时权限、依赖的资源是否确实存在，并且可被访问。

* 它是 CPython、JVM 等的报错吗？
  如果是，这说明你的代码在运行时违反了语言运行时的某些基本规则，例如在 Python 中访问了一个空引用（`NoneType` 错误）、Java 中出现了 `NullPointerException`、越界访问数组、或内存溢出等。这类错误通常指向语言本身的运行时约束，应当回顾你调用栈中的每一层，确认输入输出是否符合预期，是否存在资源未释放或对象未初始化的情况。

* 它是语言标准库或第三方库的报错吗？
  许多库在遇到边界条件或非法参数时会主动抛出异常。这种情况下你要回溯自己的调用，看看是否未正确使用这些 API，比如传入了错误的参数格式、调用顺序不当、或假设某些状态已经就绪而实际并没有。

* 它是你自己业务逻辑中的断言或异常吗？
  如果是你自己抛出的错误，比如通过 `assert` 或 `raise` 明确标记某个逻辑失败，这其实是你程序的“自我保护机制”在提醒你“假设不成立了”。这时你需要重新审视你的数据流、状态管理和控制逻辑，看是否存在某种未考虑到的边界情况。

* 它是并发或异步运行时的报错吗？
  比如死锁、竞争条件、Future 未完成、通道已关闭等。这类错误往往不是出现在代码“显眼的逻辑层”，而是在并发结构安排不当时才会暴露出来。需要使用日志、调试器甚至竞态检测工具来定位问题。




---

这篇文章我们探讨了两个「深处」：

一个是程序运行的「地基」。我们编写代码时，需要依赖这些「地基」来构建我们的程序。程序运行在操作系统上，依赖系统调用来与硬件进行交互。

另一个是程序的最终来源是「源代码」。这看起来是一句废话，实则提醒我们，不论是你自己编写的程序还是你正在使用的应用程序、你正在依赖的库，其执行逻辑都有迹可循。对于小型开源项目而言，最直接、最有效的排错方式就是阅读其源代码。
