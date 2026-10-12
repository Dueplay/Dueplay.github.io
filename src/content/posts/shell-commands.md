---
title: "Shell常用命令详解"
date: 2024-12-03
categories: ['工具']
description: '包含gcc、make、vim、tcpdump、netcat、gdb等常用Shell工具和命令的实用指南'
---

#### gcc

##### 编译流程

源代码通过编译器编译生成汇编代码

汇编代码通过汇编器翻译为机器码，生成目标文件

链接器将目标文件与任何必需的库文件（如标准库）组合在一起，解析符号引用，生成最终的可执行文件。

##### 单步执行编译过程

运行预处理器，生成预处理后的代码

```bash
gcc -E hello.c
```

运行编译器，生成汇编代码hello.s文件

```bash
gcc -S hello.c
```

运行汇编器，生成目标文件hello .o文件

```bash
gcc -c hello.s
```

运行链接器ld，链接目标文件到可执行文件,默认输出为a.out(assembler汇编程序的输出)

```bash
ld hello.o
```

在ld hello.o时，发生以下错误

```bash
ld: warning: cannot find entry symbol _start; defaulting to 0000000000401000
ld: hello.o: in function `main':
hello.c:(.text+0x13): undefined reference to `puts'
```

1. **未找到入口符号（entry symbol）**：ld 发出警告说它找不到程序的入口点 `_start`，并默认使用了一个地址。在大多数情况下，可执行文件的入口点应该是 `main` 函数。你可以通过指定入口点来解决这个问题。
2. **`puts` 函数的未定义引用**：ld 报告了 `undefined reference to 'puts'` 错误，这表示程序引用了 `puts` 函数，但没有找到该函数的定义。你需要链接标准C库以解决这个问题。

要解决这两个问题，你可以使用以下命令：

ld  hello.o -e main -lc

- `-e main`：指定程序的入口点是 `main` 函数。
- `-lc`：链接标准的C库（libc）以解决对 `puts` 等标准C库函数的引用问题。



`-static`：静态链接，不使用动态链接库。生成文件很大

#### 用户相关

useradd

userdel

#### make

启用多线程编译，以加速编译过程。

- **`make -j`（无数字）**：
  - 优点：尽可能快的编译速度，特别是在资源充足的环境下。
  - 缺点：可能会过载系统，尤其是在资源有限的机器上，影响其他应用或导致系统不稳定。
- **`make -jN`（N为数字，如 `make -j4`）**：
  - 优点：可以精确控制并行作业的数量，适当的选择可以优化编译速度和系统稳定性的平衡。
  - 缺点：需要手动确定最佳的作业数，可能不适应所有环境。
- **`make  -j$(nproc)`**：
  - 优点：自动化地选择并行作业数，通常等于CPU核心数，适合大多数情况，既快速又不会过载系统。
  - 缺点：在某些特殊情况下，如高度依赖磁盘I/O的项目，可能并不是最佳选择，因为磁盘I/O可能成为瓶颈。

#### vim

1.全选文本剪切和删除

在normal模式（Esc），

`ggvG`将光标移到文件的开头，然后选择整个文件。

`x` 剪切选中的文本

`d`删除选中的文本

2.剪切行：按下 `dd` 键。这将删除并剪切当前行。

 `yy` 来复制当前行，然后使用 `p` 将其粘贴、

3.`set nowrap` 超出屏幕一行的文字不会换行

`set wrap` 取消不换行的设置

`set nu` 显示行号

4.修改单个单词 `cw`  `ciw` 

5.全部格式化 `gg=G`

#### objdump查看二进制文件

查看目标文件反汇编代码 `-d`反汇编的意思Disassembly

```bash
objdump -d xx.o
```

#### strace追踪执行的系统调用

strace的输出位标准错误输出

- 主要的系统调用：execve, read, write

- ```
  strace -f gcc a.c
  ```

  (gcc 会启动其他进程)

  - 可以管道给编辑器 `vim -`
  - 编辑器里还可以 `%!grep` (细节/技巧)

```bash
strace ls |& grep -e read -e write
```

可以实现系统调用的过滤等，-e read -e write只输出包含read，write的行

grep反向匹配：使用 `-v` 选项查找不匹配模式的行。

使用 `-o` 选项只显示匹配的文本，而不是整行。

#### 输出重定向

- **标准输入（STDIN）**：通常表示为数字 `0`，
- **标准输出（STDOUT）**：通常表示为数字 `1`，是大多数程序输出其执行结果的默认位置。
- **标准错误（STDERR）**：表示为数字 `2`，用于输出错误信息。

在命令行中，`>` 符号用于重定向输出。`2>&1` 的意思是将标准错误（`2`）重定向到标准输出（`1`）的同一位置。这通常用于将程序的所有输出（包括错误和正常信息）合并到一个流中，便于进一步处理或记录。

```shell
# 标准输出重定向到file.txt 
command > file.txt # 等同于command 1> file.txt， 1通常省略
command > file.txt 2>&1
# 有的时候我们不想看到输出信息，也不想保存输出信息，可以考虑dev下的null设备文件，所有写进去的数据都会被丢弃。
command > /dev/null 2>&1
```

这里的 `command` 可以是任何命令、脚本或程序。这个命令做了以下两件事：

1. `> file.txt` 将 `command` 的标准输出重定向到 `file.txt`。如果 `file.txt` 不存在，它将被创建；如果已存在，它将被覆盖。
2. `2>&1` 将 `command` 的标准错误重定向到标准输出的地方，即 `file.txt`。

结果，无论 `command` 生成的是标准输出还是错误输出，所有内容都会被写入 `file.txt`。

这种重定向在脚本编写和日志记录中非常有用，特别是当你需要捕获和分析一个命令的所有输出（包括错误）时。

一个>符号表示清空文件重新写入，两个>符号表示往文件的后面追加。
