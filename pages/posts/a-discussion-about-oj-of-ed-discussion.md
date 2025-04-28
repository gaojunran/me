---
title: A discussion about Online Judge of Ed Discussion
date: 2025-04-28T00:00:00Z
lang: en
duration: 12min
---

> Translated from [this post](/posts/a-discussion-about-oj-of-ed-discussion-zh).

## TL;DR

In the Ed Discussion platform's online evaluation system, you should manually compile and run your code in the terminal instead of clicking the "Run" button to execute it.

---

## Problem Description

Professor Kuperman's challenge assignment asks us to correct C code to successfully create two directories. Like many others, I encountered the following unusual situations while working on this challenge:

- The modified code runs successfully on my local machine and creates the two directories.
- The modified code which is manually compiled and run in the Ed platform’s virtual machine terminal, successfully creates the two directories in the HOME folder. When clicking "Evaluate", **the evaluation is successful**.
- When clicking the "Run" button, there is no output in the terminal, and the program exits normally; the HOME folder doesn't have the directories created. When clicking "Evaluate", **the evaluation fails**.
- If the directories "MyFirstDirectory" and "MySecondDirectory" already exist in the current directory, the program always indicates that the directories already exist, but clicking "Evaluate" results in **evaluation success**.

In this article, I will document how I troubleshoot this unusual phenomenon and arrived at a reliable conclusion.

---

## The "Evaluate" Button

First, we can confirm that the "Evaluate" button is very simple: it checks whether there are two directories — "MyFirstDirectory" and "MySecondDirectory" — in the HOME folder of the current virtual machine. This can be easily verified:

```bash
mkdir MyFirstDirectory && mkdir MySecondDirectory
# Then click "Evaluate", and it passes successfully
```

This logic is likely designed by the professor to check if the directories are successfully created in the virtual machine.

## The "Run" Button

When clicking the "Run" button, there is NO file change in the HOME directory. I made the following attempts to investigate:

> In these attempts, I kept the code as short as possible and included minimal logic to rule out other interfering factors. This follows the GitHub open-source debugging principle of _minimal reproduction_.

### Guess 1: The source code is copied to another folder on this virtual machine for execution

Could it be that the source code is copied to another folder for compilation and execution, and the directories are created there, causing us to not see the newly created directories in the HOME folder? Let’s test this hypothesis:

```c
#include <stdio.h>
#include <unistd.h>

int main() {
    char buf[200];
    puts(getcwd(buf, sizeof(buf)));
    return 0;
}
```

When clicking the "Run" button, the terminal output was `/home`, which means this hypothesis is incorrect.

### Guess 2: The source code is compiled and run in the HOME folder, but the program immediately deletes any generated files (folders) after exiting

Since I observed that no extra files were created, not even the compiled result (e.g., `a.out`), could it be that the platform immediately deletes the compilation results and newly generated folders (which means any files generated after clicking the "Run" button) as soon as it exits?

After thinking I had found the correct answer, I made the following test, which disproved this guess:

```c
#include <unistd.h>

int main() {
    sleep(5);
}
```

This program does nothing but waits for 5 seconds (which is a long enough time). After clicking the "Run" button, still nothing was produced, not even the compiled result (`a.out`).

I wasn’t ready to give up, so I used a command-line tool called [watchexec](https://github.com/watchexec/watchexec), written in Rust, which monitors file changes and runs specified commands.

However, installing this tool on the Ed virtual machine was very difficult because its package manager, `pacman`, requires sudo permissions. So, I uploaded the watchexec binary package to the platform and manually extracted it like this:

```bash
tar -xf ./watchexec-2.3.0-x86_64-unknown-linux-gnu.tar.gz  # Extract
./watchexec-2.3.0-x86_64-unknown-linux-gnu/watchexec "ls -a"  # Run "ls -a" whenever a file changes in HOME
```

After clicking the "Run" button, there was no file change, and I gave up.

### Guess 3: All files (folders) in the HOME folder are copied to another virtual machine’s HOME for evaluation, but the evaluation result only returns standard output

To test this hypothesis, we need to run a C program to confirm that the program is not running on the current virtual machine (which we write codes and use the terminal on), but rather on another virtual machine.

There are many ways to verify this, and I will provide the simplest method:

Since we hypothesize that only files in the HOME folder are copied, we can manually create a folder outside of the HOME directory on the current virtual machine and check whether it exists in the program:

```bash
mkdir /tmp/123  # This folder is writable by all users
ls /tmp
```

The output was:

```
123    run
```

Then, click the "Run" button to run this code:

```c
#include <unistd.h>

int main() {
    execl("/bin/ls", "/bin/ls", "-d", "/tmp", NULL);
}
```

The output was:

```
run
```

There was no `123` folder! When we go back to the terminal and run `ls /tmp`, we still see it! This means the program was running on a different virtual machine.

This explains the unusual behaviors:

- After clicking the "Run" button, the directories were not created locally because they were created in **another evaluation virtual machine**.
- After clicking the "Run" button, no compilation results were produced locally because they were compiled in **another evaluation virtual machine**.
- However, it was still compiled and executed in the HOME folder on that virtual machine, and the standard output was forwarded back to this terminal, which make us think that the program was running _locally_.

---

## What is the Use of This Article?

You might find that after all these efforts, I ended up with a very simple conclusion that seems not to matter much 😭.

But this is a very typical _debugging on environment_ process. Understanding this was quite interesting to me, and I hope you can also learn something from this article!
