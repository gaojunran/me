---
title: 开源探秘 Ep 01：`fd` 实现
date: 2025-05-20T00:00:00Z
lang: zh
duration: 20min
---

这篇文章我们将分析一个开源项目 [`fd`](https://github.com/sharkdp/fd) 的源码，这是一个优秀的 Rust 项目，适合我们来进行学习。

`fd` 是 `find` 命令的现代替代品，主要有**人性化的参数传递、多线程的速度、友好的输出格式**等优质特性。

如果你手边有电脑，不妨克隆这个项目，和我一起探索吧！

## 克隆仓库

文章中，我会经常提及代码的**行号**，对于多个版本的源码行号很可能是不一致的，所以你可以以这两种形式克隆**和我完全一致**的代码：

### 检出到对应哈希

```bash
git clone https://github.com/sharkdp/fd.git
git checkout dbea8a
```

### 仅克隆此哈希的版本

```bash
npm install -g tiged  # https://github.com/tiged/tiged
tiged sharkdp/fd#dbea8a68a8b2cba8282d76e766c143948384d583
```

## `main.rs`

最近 deepwiki 很火，可以调研一个开源项目的仓库并给出一个相当详细的报告，是参与开源项目的利器。你可以在 [这里](https://deepwiki.com/sharkdp/fd) 查看 `fd` 的 deepwiki。

首先进入`main.rs`文件，这是命令行工具的入口。这个项目使用了 clap 来解析命令行参数、anyhow 来处理错误，都是非常常见的做法。使用 anyhow 提供的 `Result` 类型取代 Rust 自带的 `Result` 类型，可以更方便地处理错误：

```rust
use anyhow::Result;

fn run() -> Result<ExitCode> {...}
           // ^ equivalent to std::result::Result<ExitCode, anyhow::Error>
```

还有 `bail!` 宏可以用于提前返回错误（类似于问号操作符，但可以携带错误信息，展开作`return Err(anyhow!($args...))`）：

```rust
if search_paths.is_empty() {
    bail!("No valid search paths given.");
}
```

在解析命令行参数时，有一个值得展开讲的函数式编程写法，它将 pattern 和 额外传入的 option `exprs` 合并起来（它们均可能是正则表达式或 glob），并全部统一成正则表达式的形式：

```rust
let pattern = &opts.pattern;
let exprs = &opts.exprs;
let empty = Vec::new();

let pattern_regexps = exprs
    .as_ref()
    .unwrap_or(&empty)
    .iter()
    .chain([pattern])
    .map(|pat| build_pattern_regex(pat, &opts))
    .collect::<Result<Vec<String>>>()?;
```

这里我们探讨几个问题：

🔥 `as_ref` 有什么用？

`exprs` 是一个 `&Option<Vec<String>>` 类型，`as_ref` 方法可以将 `&Option<T>` 转换为 `Option<&T>`（这是特定于`Option`和`Result`的实现，详见[这个回答](https://users.rust-lang.org/t/what-is-the-difference-between-as-ref/76059/6)），可以依然使用借用，来避免直接解引用带来的**所有权**问题。

🔥 为什么要单独创建一个变量 `empty`？

说实话我也没找到这个 `empty` 变量非常实际的用处。将其替换成 `.unwrap_or(&Vec::new())` 也能正常工作。从生命周期的角度来看也是没什么问题的。而且上面的代码在整个程序的生命周期中只会执行一次，也不存在重复创建产生的性能问题。所以我们姑且认为这是作者的习惯。

🔥 `chain` 是如何使用的？

`chain`方法用于连接两个迭代器。来读一下 `chain` 的原型：

```rust
pub trait Iterator
pub fn chain<U>(self, other: U) -> Chain<Self, U::IntoIter>
where
    Self: Sized,
    U: IntoIterator<Item = Self::Item>
```

这是一个相当复杂的函数签名，我们逐一来进行分析：

✨ 泛型 `U`：首先这个函数定义了一个泛型，表示第二个迭代器。这个泛型将用于参数和返回值中。对这个泛型的约束是`U: IntoIterator<Item = Self::Item>`，表示第二个迭代器必须**实现了 `IntoIterator` trait**（在 `fd` 的代码中使用的是数组，这也是一个实现了这个 trait 的类型，或者可以用 `once` 构造一个仅一个元素的迭代器）。

✨ 参数：参数要求是泛型 `U`。

✨ 返回值：返回值是一个新类型 `Chain`，接受两个参数，前者是第一个迭代器中元素类型（`Self`），后者是第二个迭代器中元素的类型（`U::IntoIter`表示的是 `U` 调用 `into_iter` 方法后的迭代器类型，是在 `IntoIterator` Trait中定义的，如下：

```rust
pub trait IntoIterator {
    type Item;
    type IntoIter: Iterator<Item = Self::Item>;
    fn into_iter(self) -> Self::IntoIter;
}
```

还可以看一下 `Chain` 类型的定义。事实上 `Chain` 并不要求两个迭代器中元素的类型一定相同，但本例中是相同的，均为 `&String`。

🔥 `iter` 方法的返回值是什么？

`into_iter` 会夺走所有权、`iter` 是借用、`iter_mut` 是可变借用。所以 `iter` 方法返回 `&String`，和后面 `chain` 连接的元素类型相同。

---

前面基本都是对命令行参数的解析和对特殊情况的处理，核心逻辑是`walk::scan(&search_paths, regexps, config)`这行代码。

## `walk.rs`

接着进入正题，
并行遍历文件树的功能是由 [ignore](https://docs.rs/ignore/latest/ignore/) 这个 crate 提供的。有趣的是，这个 crate 的作者是 [`ripgrep`](https://github.com/BurntSushi/ripgrep) 的作者，这是另一个 Rust 编写的高性能命令行项目。

这里我们摘出最核心的遍历部分来讲解一下：

（`ignore-0.4.23` -> `walk.rs` -> `impl WalkParallel` -> `visit`）

```rust
pub fn visit(mut self, builder: &mut dyn ParallelVisitorBuilder<'_>) {
    let threads = self.threads();
    let mut stack = vec![];
    {
        let mut visitor = builder.build();
        let mut paths = Vec::new().into_iter();
        std::mem::swap(&mut paths, &mut self.paths);
    // ...
    }
```

这段代码初始化任务栈，为每个 `worker` 提供待处理的工作项。如果你是 Rust 的初学者，一定会有一个疑惑：这里新建一个空迭代器 `paths`，然后使用 `std::mem::swap` 交换 `self.paths` 和 `paths`，这是在做什么？为什么不直接写：`let paths = self.paths;`呢？

这是因为 Rust 对 `struct` 的字段 `move` 有一个约束：一旦部分字段被 `move`，整个 `struct` 就不能再被使用。所以为了避免所有权问题（而且我们显然不希望克隆），这里采用了一个技巧：先创建一个空的迭代器，再通过 `std::mem::swap` 把 `self.paths` 的内容“换”出来。

```rust
// Send the initial set of root paths to the pool of workers. Note
// that we only send directories. For files, we send to them the
// callback directly.
for path in paths {
    let (dent, _) = {
        match DirEntryRaw::from_path(0, path, false) {
            Ok(dent) => {
                (DirEntry::new_raw(dent, None), ...)
            }
            Err(err) => { ... }
        }
    };
    stack.push(Message::Work(Work {
        dent, // ...
    }));
}
// ... but there's no need to start workers if we don't need them.
if stack.is_empty() {
    return;
}
```

这段代码负责将路径转换成路径条目（`DirEntryRaw`），再转换成任务（`Work`）并压入工作栈 `stack` 中，供后续多线程并行处理。

接下来到了核心部分：

```rust
// Create the workers and then wait for them to finish.
let quit_now = Arc::new(AtomicBool::new(false));
let active_workers = Arc::new(AtomicUsize::new(threads));
let stacks = Stack::new_for_each_thread(threads, stack);
std::thread::scope(|s| {
    // ...
});
```

首先我们创建了几个线程安全的变量。我们使用以这种形式 `Arc::new(AtomicBool::new())` 嵌套的构造器，同时实现了**线程安全的引用计数**（`Arc`）和**高效的内部可变性**。这是一个比较复杂的话题，可以在 [这里](https://www.reddit.com/r/rust/comments/17hvbz3/comment/k6ql0pf/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) 找到一些解释。

接着我们启动了一个「作用域线程」：`std::thread::scope(|s| {}`。这个函数提供了一种方式，使得你可以在线程中**安全使用局部变量的引用**，并且保证线程在线程作用域结束前必须完成（在这个代码中，我们用 `join` 保证了一定完成），防止悬垂引用。这个函数的工作原理涉及到生命周期的一些启发性原理，可以在 [这里](https://www.reddit.com/r/rust/comments/1djkz6t/i_dont_understand_how_the_stdthreadscope/) 找到一些解释。

值得关注的是 `new_for_each_thread` 这个方法，它将工作栈 `stack` 拆分成多个栈，每个栈（`Stack`）都具有 **「工作——窃取」** 特性。这是并发文件搜索器中非常关键的设计，目的是让每个线程独立地执行任务，又能在空闲时“偷”别的线程还没做完的工作：

```rust
fn new_for_each_thread(threads: usize, init: Vec<Message>) -> Vec<Stack> {
    // Using new_lifo() ensures each worker operates depth-first, not
    // breadth-first. We do depth-first because a breadth first traversal
    // on wide directories with a lot of gitignores is disastrous (for
    // example, searching a directory tree containing all of crates.io).
    let deques: Vec<Deque<Message>> = std::iter::repeat_with(Deque::new_lifo)
        .take(threads)
        .collect();
    let stealers =
        Arc::<[Stealer<Message>]>::from(deques.iter().map(Deque::stealer).collect::<Vec<_>>());
    let stacks: Vec<Stack> = deques
        .into_iter()
        .enumerate()
        .map(|(index, deque)| Stack {
            index,
            deque,
            stealers: stealers.clone(),
        })
        .collect();
    // Distribute the initial messages.
    init.into_iter()
        .zip(stacks.iter().cycle())
        .for_each(|(m, s)| s.push(m));
    stacks
}
```

上面这段英文注释解释了我们应当使用深度优先而不是广度优先的策略来进行遍历。创建线程数量个 LIFO 队列（实际上是栈），每个队列都拥有一个窃取器（`Stealer`），用于从其他队列中“偷”任务。接着构造每个线程的 Stack，包括自己的编号、自己的任务队列、所有线程的 `stealers` 副本（通过 `Arc` 共享）。最后，将初始任务分配到各个线程中。分配方式是轮询，如第一个任务给线程 0，第二个线程 1，第三个线程 2，第四个又回到线程 0... 如果你感兴趣，可以去 ignore crate 里看一下 Stack 这个工作窃取器的完整实现。

接着我们回到 `visit` 函数中，展示作用域线程中的代码：

```rust
std::thread::scope(|s| {
    let handles: Vec<_> = stacks
    .into_iter()
    .map(|stack| Worker {
        visitor: builder.build(),
        stack,
        quit_now: quit_now.clone(),
        active_workers: active_workers.clone(),
        // ...
    })
    .map(|worker| s.spawn(|| worker.run()))
    .collect();
    for handle in handles {
        handle.join().unwrap();
    }
});
```

我们把上面构造好的 `Stack` 依次构造出 `Worker`，并使用 `spawn` 来启动线程。使用 `map` 收集所有线程的句柄，并使用 `join` 等待所有线程完成（这同时也是`thread::scope`生命周期的保证）。多线程部分**核心执行**的代码非常简单，`spawn`即可。但你会发现我们为了保证并发的**正确性**做了大量操作，使得并发程序更安全和可维护。

实际的「读」文件夹的过程（即`worker.run()`）实际上非常简单，但是充斥着复杂的业务逻辑，如果你感兴趣也可以去读一下，这里不再展开了。

## 总结

我们展开分析了 `fd` 这个命令行工具的核心实现。包括如何使用并发来充分利用多核性能的同时保证正确性、以及展开讲了一些 Rust 的类型系统和函数式编程的知识，希望能对你有所帮助！

📝 篇幅所限，`fd` 有非常多的命令行参数和选项，这里都没有展开来讲解其中具体的实现。但是我们已经提及了其中最难的部分，其余部分想必你自己也能看懂。还有实际的遍历文件夹部分，也是涉及到大量的业务逻辑，如果你想成为 `fd` 的贡献者，不妨从阅读源码开始吧！
