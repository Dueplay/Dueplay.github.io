---
title: linux基础知识
date: 2021-03-20T15:30:09+08:00
# weight: 1
# aliases: ["/first"]
tags: ["linux"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "linux基础知识"
canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableShare: true
disableHLJS: false
hideSummary: false
searchHidden: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
cover:
    image: "<image path/url>" # image path/url
    alt: "<alt text>" # alt text
    caption: "<text>" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/Dueplay/blog/content"
    Text: "Suggest Changes" # edit text
    appendFilePath: true # to append file path to Edit link
---

## 一、目录

1./bin：可执行二进制文件的目录，绿色是可执行文件，

输入命名./date，date可执行文件执行。cat命令，查看文本文件内容，ctrl+c退出。

2./boot：linux启动时用到的文件。reboot：重启。

3./dev：存放设备文件，一切皆文件。

sudo cat mice鼠标移动，输出。

sudo临时获得一次管理员权限，cat是查看文件，mice是鼠标文件。

4./etc：os相关的一些配置文件。cat passwd查看密码。

5./home：用户的家目录会存在这。Linux系统支持多用户访问。~表示当前用户的家目录。

6./lib：系统使用的函数库的目录。

7./root：系统管理员的家目录。普通用户的家目录：/home/cookie。

切换成管理员账户，sudu su。退出 exit。

切换普通用户：su 用户名。退出 exit。

cookie（用户名）@（at在）主机名：当前工作目录$(普通用户)#（管理员）

cd空格 回车：回到当前用户的“家”目录，宿主目录，这个用户的所有数据。不是home。

cd空格 - 回到上次工作目录。

8./tmp：一般用户或正在执行的程序临时存放文件的目录。

9./usr：unix system resource，应用程序存放目录。

## 二、文件类型

linux下不以后缀名区分文件类型。ls -l 查看文件详细信息。

普通文件-

目录文件d

套接字文件s

软链接文件l

字符设备文件c

块设备文件b

管道文件p

![image-20220613101418983](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613101418983.png)

第一个为文件类型，后面9个，三个一组，r可读，w可写，x可执行。分别为文件所有者权限，所属组权限，其他人的权限。数字2代表硬链接计数。第一个cookie为文件所有者，第二个是所属组。文件所占用的空间大小（byte），最后一次修改时间，文件名。

gedit 文件名：用记事本编辑文件。

## 三、命令

命令格式：命令 -可选 参数

查看帮助文档：ls --help；man 1 xxx：1是标准命令，2是系统调用，3是库函数

ctrl+p/n 上/下一条命令

ctrl+u 清空

ctrl+b 光标向前移动一个字符

ctrl+a 光标移动到最前

ctrl+e 光标移动到最后

通配符：ls std*.h  ls std??.h *代表一堆，？代表一个字符。

![image-20220613110739350](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613110739350.png)

输出重定向：>

![image-20220613110949699](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613110949699.png)

追加>>

![image-20220613111158446](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613111158446.png)

删除：rm -f强制删 ；rm -r 递归删（无敌），删目录时必须用这个。

建立链接文件ln

查看或合并文件内容：cat，合并要借助重定向。

拷贝文件：cp 文件名 目录/新名字

拷贝目录，cp -a保留原有文件格式，创建时间没变；cp -r递归的拷贝，重新创建新的。

移动文件：mv（移动文件和改名作用） mv 文件名 目录（目录不存在则把文件名改为目录的名字）

file：查看文件类型。

![image-20220614084626924](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220614084626924.png)

归档管理（压缩打包）：tar zcvf（gzip格式压缩） xxx.tar.gz（压缩包名）  yyy1 yyy2 yyy3（yyy为打包材料）

tar.gz可以不加，但不直观。 z是gzip方式压缩，c是创建，v是展示压缩列表啥东西被打包了，f是指定压缩文件名。

tar jcvf（bzip2格式压缩） xxx.tar.bz2（压缩包名）  yyy1 yyy2 yyy3（yyy为打包材料）

解压：tar z(j)xvf 压缩包名

查看命令位置：which ls

修改文件权限：r：4  w：2 x：1 

7==rwx 5==w-x

chmod 755 file1

修改目录里面的所有文件的权限

chmod 777 dir -R：将dir里面的文件权限全部改为rwx

查看进程：ps aux

杀掉经常：kill -9 进程id

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

#### top

`top` 命令是 Linux 和 Unix 系统中常用的性能监控工具，用于实时显示系统的任务管理器，提供关于系统总体性能和各个进程的详细信息。

默认情况下，`top` 命令会显示以下信息：

1. **系统总体信息**：

   - **uptime**：系统运行时间。
   - **用户数量**：当前登录的用户数量。
   - **负载平均值**：系统在1分钟、5分钟和15分钟内的平均负载。
   - **任务信息**：任务的总数、正在运行的任务、睡眠的任务、停止的任务和僵尸任务的数量。
   - **CPU使用率**：包括用户空间、系统空间、空闲时间和其他详细信息。
   - **内存使用情况**：物理内存和交换内存的总量、使用量和可用量。

2. **每个进程的详细信息**：

 在 top 命令界面中，可以使用以下快捷键进行操作：

q：退出 top。
h：显示帮助信息。
k：杀死一个进程。按 k，然后输入进程ID（PID）并按回车键，接着输入信号类型（默认是 15，表示正常终止）。
r：重新调整一个进程的优先级。按 r，然后输入进程ID（PID）并按回车键，接着输入新的优先级值（-20到19）。
u：按用户过滤进程。按 u，然后输入用户名。
P：按CPU使用率排序。
M：按内存使用率排序。

- -p:仅监视指定的进程ID。

  ```shell
  top -p 1234
  ```

- -u:按指定用户显示进程。

  ```shell
  top -u username
  ```

#### diskpart

```powershell
diskpart
list disk
select disk X  # 替换 X 为你的目标磁盘编号
create partition primary size=102400  # 创建一个主分区，大小为100GB
format fs=ntfs quick
format fs=fat32 unit=4096 quick
assign letter=D
exit
# 列出磁盘上的分区
list partition
# 选择新创建的分区
select partition Y
detail partition
# 查看disk详细信息
detail disk
```

#### tmux

终端复用工具

```bash
# 安装
sudo apt install tmux
# 在当前终端开一个tmux终端
tmux
# 退出tmux回到终端
ctrl+b d
# 新建一个新tmux并命令为ping
tmux new -s ping
# 查看有几个tmux
tmux ls
0: 1 windows (created Thu Nov 30 21:01:43 2023)
ping: 1 windows (created Thu Nov 30 21:05:51 2023)
# 回到tmux0
tmux attach -t 0
# 在tmux0中切换到tmux ping中
tmux switch -t ping
# 关掉tmux0
tmux kill-seesion -t 0
# 关掉tmux ping
tmux kill-session -t ping
```

#### netcat

检查版本：

```shell
readlink -f $(which nc) # $(...): 这是命令替换的语法。它执行括号里的命令，并将输出替换到外部命令中。
```

结果会有两种：

- `/bin/nc.traditional`: 默认 GNU 基础版本，一般系统自带。
- `/bin/nc.openbsd`: openbsd 版本，强大很多。

都可以用 `apt-get install nc-traditional` 或者 `apt-get install nc-openbsd` 来选择安装。不管是 gnu 版本还是 openbsd 版本，都有新老的区别，主要是传送文件时 stdin 发生 EOF 了，老版本会自动断开，而新的 gnu/openbsd 还会一直连着

**端口测试**

你在服务器 A主机（192.168.1.2） 上面 8080 端口启动了一个服务，有没有通用的方法检测服务的 TCP 端口是否启动成功？或者在 B 主机上能不能正常访问该端口？

进一步，如果而 A 主机上用 netstat -an 发现端口成功监听了，你在 B 主机上的客户端却无法访问，那么到底是服务错误还是网络无法到达呢？我们当然可以在 B 主机上用 telnet 探测一下：

```bash
telnet 192.168.1.2 8080
```

但 telnet 并不是专门做这事情的，还需要额外安装，所以我们在 B 主机上用 netcat：

```bash
nc -vz 192.168.1.2 8080
```

即可，v 的意思是显示多点信息（verbose），z 代表不发送数据。那么如果 B 主机连不上 A 主机的 8080 端口，此时你就该检查网络和安全设置了，如果连的上那么再去查服务日志去。

nc 命令后面的 8080 可以写成一个范围进行扫描：

```bash
nc -v -v -w3 -z 192.168.1.2 8080-8083
```

两次 `-v` 是让它报告更详细的内容，`-w3` 是设置扫描超时时间为 3 秒。

**传输测试**

你在配置 iptable 或者安全组策略，禁止了所有端口，但是仅仅开放了 8080 端口，你想测试一下该设置成功与否怎么测试？安装个 nginx 改下端口，外面再用 chrome 访问下或者 telnet/curl 测试下？？还是 python -m 启动简单 http 服务 ？其实不用那么麻烦，在需要测试的 A 主机上：

```bash
nc -l -p 8080
```

这样就监听了 8080 端口，然后在 B 主机上连接过去：

```bash
nc 192.168.1.2 8080
```

两边就可以会话了，随便输入点什么按回车，另外一边应该会显示出来，注意，openbsd 版本 netcat 用了 `-l` 以后可以省略 `-p` 参数，写做：`nc -l 8080` ，但在 GNU netcat 下面无法运行，所以既然推荐写法是加上 `-p` 参数，两个版本都通用。

**nc** 命令作为客户端时可以使用 **-p** 选项指定使用哪个端口号连接服务器。

**老版本的 nc 只要 CTRL+D 发送 EOF 就会断开**，新版本一律要 CTRL+C 结束，**不管是服务端还是客户端只要任意一边断开了，另一端也就结束了，但是 openbsd 版本的 nc 可以加一个 `-k` 参数让服务端持续工作**。

那么你就可以先用 nc 监听 8080 端口，再远端检查可用，然后又再次随便监听个 8081 端口，远端检测不可用，说明你的安全策略配置成功了，完全不用安装任何累赘的服务。

**测试 UDP 会话**

两台主机 UDP 数据发送不过去，问题在哪呢？你得先确认一下两台主机之间 UDP 可以到达，这时候没有 nginx 给你用了，怎么测试呢？用 python 写个 udp 的 echo 服务？？ netcat 又登场了，在 A 主机上：

```bash
nc -u -l -p 8080
```

监听 udp 的 8080 端口，然后 B 主机上连上去：

```bash
nc -u 192.168.1.2 8080
```

然后像前面测试 tcp 的方法进行检测，结束了 CTRL+C 退出，看看一边输入消息另外一边能否收到。

**文件传输**

你在一台 B 主机上想往 A 主机上发送一个文件怎么办？不能用 scp / szrz 的话？继续 python 写个 http 上传？装个 ftpd 服务？不用那么麻烦，在 A 主机上监听端口：

```bash
nc -l -p 8080 > image.jpg
```

然后再 B 主机上：

```bash
nc 192.168.1.2 8080 < image.jpg
```

netcat 嘛，就是用于通过网络把东西 cat 过去，注意，老版本 GNU / OpenBSD 的 netcat 在文件结束（标准输入碰到 EOF），发送文件一端就会关闭连接，而新版本不会，你需要再开个窗口到 A 主机上看看接收下来的文件尺寸和源文件比较一下判断传输是否结束。

当传输完成后，你再任意一端 CTRL+C 结束它。对于新版 OpenBSD 的 netcat 有一个 `-N` 参数，可以指明 stdin 碰到 EOF 就关闭连接（和老版本一致），我们写作：

```bash
/bin/nc.openbsd -N 192.168.1.2 8080 < image.jpg
```

你机器上的 `nc` 命令有可能指向 `/bin/nc.traditional` 或者 `/bin/nc.openbsd` 任意一个，这里显示指明调用 openbsd 版本的 netcat。

这样在 openbsd 新版本的 netcat 中使用 `-N`参数，就不需要再开个终端去手工检查传输是否完成，传输结束了就会自动退出。其实 GNU 版本的 netcat 也有可以加个 `-q0` 参数，达到和 openbsd 版本 `-N` 的效果：

```bash
/bin/nc.traditional -q0 192.168.1.2 8080 < image.jpg 
```

只不过是 Linux 下面最新的 GNU netcat，对应 Windows 版本 没有该参数，所以从 Windows 传文件过去时，少不了再开个终端看一下进度，如果是 Linux 端发送就没问题了。通过管道协作，搭配 tar 命令，还可以方便的传一整个目录过去。

使用 netcat 这个系统默认安装的工具进行文件传输，可以算作你保底的手段，当 scp/ftp 都没法使用的情况下，你的一个杀手锏。

**网速吞吐量测试**

最简单的方法，GNU 版本的 netcat 加上 `-v -v` 参数后，结束时会统计接收和发送多少字节，那么此时 A 主机上显示运行 GNU 版本的 nc 监听端口：

```bash
/bin/nc.traditional -v -v -n -l -p 8080 > /dev/null
```

加 n 的意思是不要解析域名，避免解析域名浪费时间造成统计误差，然后 B 主机上：

```bash
time nc -n 192.168.1.2 8080 < /dev/zero
```

回车后执行十秒钟按 CTRL+C 结束，然后在 A 主机那里就可以看到接收了多少字节了，此时根据 time 的时间自己做一下除法即可得知，注意 GNU 的 netcat 统计的数值是 32 位 int，如果传输太多就回环溢出成负数了。

对于 OpenBSD 版本的 nc 我们可以用管道搭配 dd 命令进行统计，服务端运行：

```bash
nc -l -p 8080 > /dev/null
```

客户端运行 dd 搭配 nc：

```bash
dd if=/dev/zero bs=1MB count=100 | /bin/nc.openbsd -n -N 192.168.1.2 8080
```

结束以后会有结果出来，注意这里使用了 `-N` 代表 stdin 碰到 EOF 后就关闭连接，这里凡是写 `nc` 命令的地方，代表 GNU/OpenBSD 任意版本的 netcat 都可以，显示的指明路径，就代表必须使用特定版本的 netcat，上条命令等效的 GNU 版本是：

```bash
dd if=/dev/zero bs=1MB count=100 | /bin/nc.traditional -n -q0 192.168.1.2 8080
```

其实上面两种方法都把建立连接的握手时间以及 TCP 窗口慢启动的时间给计算进去了，不是特别精确，最精确的方式是搭配 pv 命令（监控统计管道数据的速度），在 A 主机运行：

```bash
nc -l -p 8080 | pv
```

然后再 B 主机运行：

```text
nc 192.168.1.2 8080 < /dev/zero
```

此时 A 主机那端持续收到 B 主机发送过来的数据并通过管道投递给 pv 命令后，你就能看到实时的带宽统计了，pv 会输出一个实时状态：

```bash
 353MiB 0:00:15 [22.4MiB/s] [          <=>  ]
```

让你看到最新的带宽吞吐量，这是最准确的吞吐量测试方法，在不需要 iperf 的情况下，直接使用 nc 就能得到一个准确的数据。

**系统后门**

假设你用串口登录到 A 主机，上面十分原始，包管理系统都没有，sshd/telnetd 都跑不起来，这时候你想用 B 主机通过网络登录 A 主机有没有办法？

GNU 版本的 netcat 有一个 `-e` 参数，可以在连接建立的时候执行一个程序，并把它的标准输入输出重定向到网络连接上来，于是我们可以在 A 主机上 `-e` 一下 bash：

```bash
/bin/nc.traditional -l -p 8080 -e /bin/bash
```

按回车打开系统后门，然后再 B 主机那里照常：

```bash
nc 192.168.1.2 8080
```

你就可以在 B 主机上登录 A 主机的 shell 了，操作完成 CTRL+C 结束。

对于 openbsd 版本的 netcat，`-e` 命令被删除了，没关系，我们可以用管道来完成，和刚才一样，在 A 主机上：

```bash
mkfifo /tmp/f
cat /tmp/f | /bin/bash 2>&1 | /bin/nc.openbsd -l -p 8080 > /tmp/f
```

然后 B 主机和刚才一样：

```bash
nc 192.168.1.2 8080
```

即可访问，用完注意将 `/tmp/f` 这个 fifo 文件删除。

#### ps

查看每个进程的更多信息，包括用户ID、CPU和内存使用、启动时间等

```shell
ps -aux
```

显示指定用户的所有进程

``` shell
ps -u [username]
```

显示进程树

```shell 
ps -ejH
```

 `ps` 命令本身不支持实时更新，但可以结合 `watch` 命令实现这一功能：

```shell
watch ps aux
```

按CPU或内存使用排序：将进程按CPU或内存使用量降序排序

```shell
ps aux --sort=-pcpu
ps aux --sort=-pmem
```

#### netstat

查看当前系统上所有 TCP 和 UDP 端口的监听状态，并显示关联到这些端口的进程信息

```shell
netstat -tulnp 
```

**`-n`** (Numeric)： 显示原始的数字地址和端口号，而不是尝试解析主机名、服务名或端口名。这加快了命令的执行速度并减少了命令可能因解析而失败的情况

**`-p`** (Program)： 显示哪个进程正在使用指定的套接字。这对于确定哪个应用程序正在监听或建立特定的网络连接特别有用。注意，这个选项通常需要 root 权限才能看到所有信息。

#### lsof

**lsof** 命令是 Linux 系统的扩展工具，它的含义是 **l**i**s**t **o**pened **f**iledesciptor （**列出已经打开的文件描述符**）。

默认情况下，系统是不存在这个命令的，需要安装一下

```shell
sudo apt install lsof
```

默认情况下，**lsof** 的输出比较多，我们可以使用 grep 命令过滤我们想要查看的进程打开的 fd 信息，如：

```shell
lsof -i | grep process
```

或者使用 **lsof -p pid** 也能过滤出指定的进程打开的 fd 信息.

socket 也是一种 fd，如果需要仅显示系统的网络连接信息，使用的是 **-i** 选项即可.

和 **netstat** 命令一样，**lsof -i** 默认也会显示 ip 地址（hostname）和端口号的别名，我们只要使用 **-n** 和 **-P** 选项就能相对应地显示 ip 地址和端口号了，综合起来就是 **lsof -Pni**

#### find

```shell
# 按名称查找文件：在指定目录及其子目录中搜索名为 filename.txt 的文件。
find /path/to/search -name filename.txt 

# 按类型查找文件：
find /path -type f 查找所有文件。
find /path -type d 查找所有目录。

# 按修改时间查找文件
find /path -mtime +10 查找 10 天前修改的文件。
find /path -mtime -10 查找最近 10 天内修改的文件。
-mmin -10：搜索最近 10 分钟内修改的文件。

# 按大小查找文件
find /path -size +50M 查找大于 50 MB 的文件。
在找到的文件上执行命令

find /path -type f -exec rm {}\; 删除指定路径下的所有文件。
将测试与逻辑操作符相结合：

find /path \( -name "*.txt" -or -name "*.pdf" \) 查找所有 .txt 和 .pdf 文件。
```

#### tcpdump

**tcpdump** 是 Linux 系统提供一个非常强大的抓包工具，对排查网络问题非常有用。使用之前需要安装

```shell
sudo apt install tcpdump
```

如果要使用 **tcpdump** 命令必须具有 **sudo** 权限。

**tcpdump** 常用的选项有：

- **-i** : 指定要捕获的目标网卡名，网卡名可以使用`ifconfig`查看；如果要抓所有网卡的上的包，可以使用 **any** 关键字。

  ```shell
  ## 抓取网卡ens33上的包
  tcpdump -i ens33
  ## 抓取所有网卡上的包
  tcpdump -i any
  ```

- **-X** : 以 ASCII 和十六进制的形式输出捕获的数据包内容，减去链路层的包头信息；**-XX** 以 ASCII 和十六进制的形式输出捕获的数据包内容，包括链路层的包头信息。

- **-n** : 不要将 ip 地址显示成别名的形式；**-nn** 不要将 ip 地址和端口以别名的形式显示。

- **-S** 以绝对值显示包的 ISN 号（包序列号），默认以上一包的偏移量显示。

- **-vv** 抓包的信息详细地显示；**-vvv** 抓包的信息更详细地显示。

- **-w** 将抓取的包的原始信息（不解析，也不输出）写入文件中，后跟文件名：

  ```
  tcpdump -i any -w filename
  ```

- **-r** 从利用 **-w** 选项保存的包文件中读取数据包信息。

除了可以使用选项以外，**tcpdump** 还支持各种数据包过滤的表达式，常见的形式如下：

```shell
# 仅显示经过端口 8888 上的数据包（包括tcp:8888和udp:8888）
tcpdump -i any 'port 8888'

# 仅显示经过端口是 tcp:8888 上的数据包
tcpdump -i any 'tcp port 8888'

# 仅显示从源端口是 tcp:8888 的数据包
tcpdump -i any 'tcp src port 8888'

# 仅显示源端口是 tcp:8888 或目标端口是 udp:9999 的包 
tcpdump -i any 'tcp src port 8888 or udp dst port 9999'

# 仅显示地址是127.0.0.1 且源端口是 tcp:9999 的包 ，以 ASCII 和十六进制显示详细输出，
# 不显示 ip 地址和端口号的别名
tcpdump -i any 'src host 127.0.0.1 and tcp src port 9999' -XX -nn -vv
```

实例1.

使用nc模拟服务端监听1234端口

```shell
nc -v -l 127.0.0.1 1234
```

tcpdump 捕获port 1234上的数据包

```shell
sudo tcpdump -i any 'port 1234' -XX -nn -vv -S
```

使用nc模拟客户端连接服务器

```shell
nc -v 127.0.0.1 1234
```

通过tcpdump的输出可以看到三次握手的过程：客户端先给服务器发送一个 **SYN**，然后服务器应答一个 **SYN + ACK**，应答的序列号是递增 **1** 的，表示应答哪个请求，接着客户端再应答一个 **ACK**。

![image-20240118104321204](E:\db资料\Note\some command.assets\image-20240118104321204.png)

实例二：连接一个不存在的侦听端口

实例一演示的是正常的 TCP 连接三次握手过程捕获到的数据包。假如我们连接的**服务器 ip 地址存在**，但**监听端口号不存在**
![image-20240118104754153](E:\db资料\Note\some command.assets\image-20240118104754153.png)

抓包数据如下：

![image-20240118104716795](E:\db资料\Note\some command.assets\image-20240118104716795.png)

这个时候客户端发送 **SYN**，服务器应答 **ACK+RST**，这个应答包会导致客户端的 connect 连接失败返回。

#### gdb

前提：

1.在编译时需要`-g`选项使程序带有调试符号信息。

strip 命令移除掉某个程序中的调试信息：在程序测试没问题后，需要发布到生产环境或者正式环境，会生成不 带调试符号信息的程序，以减小程序体积或提高程序执行效率。

2.建议关闭编译器的程序的优化选项。编译器的程序的优化选项一般有五个级别，从 O0~O4（注意第一个O0，是字母 O 加上数字 0）， O0 表示不优化（关闭优化），从 O1~O4 优化级别越来越高，O4 最大。关闭优化的目的是为了调试的时候，符号文件显示的调试变量等能与源代码完全对应起来。

##### 调试程序目标程序

```shell
# 使用 gdb 启动一个程序进行调试，也就是说这个程序还没有启动
gdb ./your_program

# 查看各个命令帮助
help cmd

# 设置命令行参数,单个命令行参数之间含有空格，可以使用引号将参数包裹起来
set args arg1 arg2 arg3
# 如果想清除掉已经设置好的命令行参数，使用 set args 不加任何参数即可
# 也可以在启动时设置参数
gdb --args ./your_program arg1 arg2 arg3
#查看设置的命令行参数
show args 
#运行
run # 简写r

❯ db.cpp:79
zsh: command not found: db.cpp:79
❯ create_table_executor.cpp:24
zsh: command not found: create_table_executor.cpp:24
❯ table.cpp:53

# 查看当前断点，当前执行语句附近的代码
list # 简写l
# 第一次输入 list 命令，会显示断点处前后的代码，继续输入 list指令会以递增行号的形式继续显示剩下的代码行，一直到文件结束为止。 list 指令可以往前和往后显示代码，命令分别是 list + 和 list - 

# 开启TUI（Text User Interface）模式。GDB的TUI模式提供了一个文本界面，可以在调试时显示源代码、汇编代码、寄存器状态和GDB输出.
1.gdbtui -q 需要调试的程序名
2.直接使用 gdb 调试代码,使用Ctrl + X，然后按A可以在TUI模式和常规模式之间切换。在TUI模式中，可以使用方向键上下滚动代码,Ctrl + X,然后按o可在让焦点在源码和命令之前切换。
layout src #显示源代码窗口,src,reg,asm

src : the source window
cmd : the command window
asm : the disassembly window
regs : the register display
# 将代码窗口的高度扩大5行代码
winheight src + 5
# 将代码窗口的高度减小4代码
winheight src - 4

# print可以输出变量值，也可以输出特定表达式计算结果值，甚至可以输出一些函数的执行结果值
p var # 打印变量的值。想输出该指针指向的对象的值，在变量名前面加上 * 解引用即可
# 将这个错误码对应的文字信息打印出来
p strerror(errno) 
# 修改变量的值
p i=1000
# print 输出变量值时可以指定输出格式，命令使用格式如下：
print /format variable

format 常见的取值有：
o octal 八进制显示
x hex 十六进制显示
d decimal 十进制显示
# 输出一个变量的类型
ptype variable
# 使输出更易读
set print pretty on # 关闭off

#监视某一个变量或内存地址的值是否发生变化。发送变化时，gdb 就会中断下来。监视某个变量或者某个内存地址会产生一个“watch point”（观察点）。
watch 变量名或内存地址
# 需要注意的是：当设置的观察点是一个局部变量时。局部变量无效后，观察点也会失效

# display 命令监视的变量或者内存地址，每次程序中断下来都会自动输出这些变量或内存的值
display 变量名
info display
delete display 编号

# 断点操作
b [函数名] # eg: b main
b [文件名]:[行号]
b [行号] # 当前文件
b [位置] if [条件] #在条件满足时触发断点
b [文件名]:[行号] thread [线程ID] # 只有当指定的线程达到该断点时，程序才会停止

# 列出所有断点
info breakpoints # 简写info b
# 禁用和启用断点，如果 disable 和 enable 命令不加断点编号，则分别表示禁用和启用所有断点
disable [断点号]
enable [断点号]

# 删除断点
delete [断点号]
delete # 删除全部断点
# 设置临时断点
tbreak [位置] #简写tb，该断点触发一次后自动删除。

# 断点触发后的操作
# 1.继续执行程序：当程序在断点处暂停时，使用此命令继续执行。
continue # c

# 逐行执行：在断点处执行下一行代码（不进入函数内部）。
next # n

#单步执行：执行下一行代码，如果是函数调用，则进入函数内部。
step # s
# 在这样的代码func3(func1(1, 2), func2(8, 9))输入s，会先进入哪个函数呢？
# 函数调用方式，我们常用的函数调用方式有 __cdecl、__stdcall，C++ 的非静态成员函数的调用方式是__thiscall，这些调用方式，函数参数的传递本质上是函数参数的入栈的过程，而这三种调用方式参数的入栈顺序都是从右往左的，所以，这段代码中并没有显式标明函数的调用方式，所以采用默认__cdecl 方式。
# 所以输入 step 先进入的是 func2()，当从 func2() 返回时再次输入step 命令会接着进入 func1()，当从 func1 返回时，此时两个参数已经计算出来了，这时候会最终进入 func3() 

# 在某个函数中调试一会儿后，我们不需要再一步步执行到函数返回处，我们希望直接执行完当前函数并回到上一层调用处，
finish  
# 与 finish 命令类似的还有return 命令，return 命令作用是在当前位置结束当前函数的执行，并返回到上一层调用，还可以指定该函数的返回值。二者的区别：finish 命令会执行函数到正常退出该函数；而 return 命令是立即结束执行当前函数并返回，也就是说，如果当前函数还有剩余的代码未执行完毕，也不会执行了

# 指定程序运行到某一行停下来
until # 想直接跳到 2774 行，直接输入 u 2774


# 查看当前所在线程的调用堆栈，能够知道调用层级关系
backtrace # 简写bt
# 切换到其他堆栈处
frame 堆栈编号 # 简写f，编号不用加#
# 查看当前函数的参数值
info args

# 换到不同的线程
info threads # 查看当前所有的线程。每个线程都会有一个唯一的ID。
# 切换线程，比如，要切换到线程ID为 2 的线程
thread 2
# 然后就可以使用 continue、next、step 和 finish 等命令控制线程的执行。这些命令会在当前选中的线程上执行。
# 我们单步调试线程 A 时，我们不希望线程 A 函数中的值被其他线程改变。gdb 提供了一个在调试时将程序执行流锁定在当前调试线程的命令选项- scheduler-locking，这个选项有三个值，分别是 on、step 和 off，
set scheduler-locking on/step/off
# set scheduler-locking on 可以用来锁定当前线程，只观察这个线程的运行情况， 当锁定这个线程时， 其他线程就处于了暂停状态，也就是说你在当前线程执行 next、step、until、finish、return 命令时，其他线程是不会运行的。

set scheduler-locking step 
#也是用来锁定当前线程，当且仅当使用 next 或 step 命令做单步调试时会锁定当前线程，如果你使用 until、finish、return 等线程内调试命令，但是它们不是单步命令，所以其他线程还是有机会运行的。

set scheduler-locking off #用于关闭锁定当前线程。


# 调试多进程，这里说的多进程程序指的是一个进程使用 Linux 系统调用 fork 函数产生的子进程
1.用 gdb 先调试父进程，等子进程被 fork 出来后，使用 gdb attach 到子进程上去
2.gdb 调试器提供一个选项叫 follow-fork ，通过 set follow-fork mode 来设置是当一个进程 fork 出新的子进程时，gdb 是继续调试父进程（取值是 parent）还是子进程（取值是 child），默认是父进程（取值是 parent）

# fork之后gdb attach到子进程
set follow-fork child
# fork之后gdb attach到父进程，这是默认值
set follow-fork parent
# 查看当前值
show follow-fork mode

# gcc/g++ 编译出来的可执行程序并不包含完整源码，-g 只是加了一个可执行程序与源码之间的位置映射关系，我们可以通过 dir 命令重新定位这种关系。
dir SourcePath1:SourcePath2:SourcePath3 # 指定多个路径，使用:
# dir 命令不加参数表示清空当前已设置的源码搜索目录
dir
# SourcePath1、SourcePath2、SourcePath3 指的就是需要设置的源码目录，gdb 会依次去这些目录搜索相应的源文件。

# 将 print 显示的字符串或字符数组显示完整
使用 print 命令打印一个字符串或者字符数组时，如果该字符串太长，print 命令默认显示不全的，我们可以通过在 gdb 中输入 set print element 0 设置一下，这样再次使用 print 命令就能完整地显示该变量所有字符串了。
# 让被gdb调试的程序接收信号
我们让程序在接收到 Ctrl + C 信号（对应信号值是 SIGINT）时简单打印一行信息，当我们用 gdb 调试这个程序时，由于 Ctrl + C 默认会被 gdb 接收到（让调试器中断下来），导致我们无法模拟程序接收这一信号。解决这个问题有两种方式：
1. 在 gdb 中使用 signal 函数手动给我们的程序发送信号，这里就是 signal SIGINT 
2. 改变 gdb 信号处理的设置，通过 handle SIGINT nostop print pass告诉 gdb 在接收到 SIGINT 时不要停止、并把该信号传递给调试目标程序 

```

##### 附加进程

某些情况下，一个程序已经启动了，我们想调试这个程序，但是又不想重启这个程序。假设有这样一个场景，我们的聊天测试服务器程序正在运行，我们运行一段时间之后，发现这个聊天服务器再也没法接受新的客户端连接了，这个时候我们肯定是不能重启程序的，如果重启，当前程序的各种状态信息就丢失了。这个时候，我们只需要使用 `gdb attach 程序进程ID`来将 gdb 调试器附加到我们的聊天测试服务器程序上即可。假设，我们的聊天程序叫 chatserver，我们可以使用 ps 命令获取该进程的 PID，然后 gdb attach 上去，就可以调试了。

```shell
ps -ef | grep chatserver
```

我们得到 chatserver 的 PID 为 42921，然后我们使用 gdb attach 42921 把 gdb 附加到 chatserver 进程：

```shell
gdb attach 42921 # 42921 = $(pidof chatserver)
```

当用 `gdb attach` 上目标进程后，调试器会暂停下来，此时我们可以使用 `continue` 命令让程序继续运 行，或者加上相应的断点再继续运行程序。

当您调试完程序想结束此次调试，且不对当前进程 chatserver 有任何影响，也就是说想让这个程序继续运行，可以在gdb的命令行界面输入 `detach` 命令让程序与 gdb 调试器分离，这样 chatserver 可以继续运行。然后再退出gdb就可以了。

##### 进程 Crash 之后如何定位问题——调试 core 文件

有时候，我们的程序运行一段时间后，会突然崩溃。这当然不是我们希望看到的，我们需要解决这个问题。只要程序在崩溃的时候，有 core 文件(当一个程序崩溃并产生 "core dumped" 时，生成的核心转储文件,通常称为 "core" 文件。核心转储文件用于保存程序崩溃时的内存快照)产生，我们就可以使用这个 core 文件来定位崩溃的原因。当然，Linux 系统默认是不开启程序崩溃产生 core 文件的这一机制的，我们可以使用 `ulimit -c` 来 查看系统是否开启了这一机制。（ulimit 这个命令不仅仅可以查看 core 文件生成是否开 启，还可以查看其它的一些功能，如系统允许的最大文件描述符的数量等等，具体的可以使用 `ulimit - a` 命令来查看。）

如果我们需要修改某个选项的值， 可以使用 `ulimit 选项名 设置值`来修改，例如我们可以将 core 文件生成改成具体某个值（最大允许的字节数）或不限制大小，这里我们直接改成不限制大小，执行命令 `ulimit -c unlimited`

```shell
ulimit -c unlimited
ulimit -a
```

还有一个问题就是，这样修改以后，只对当前会话有效，当我们关闭这个 Linux 会话后，这个设置项的值就会被还原成 0。如果我们的程序以后台程序（守护进程）运行，也就是说当前会话虽然被关闭，程序仍然继续在后台运行，这样这个程序崩溃在某个时刻崩溃后，是无法产生 core 文件，这种情形不利于排查问题。所以，我们希望这个选项永久生效。设置永久生效的方式有两种。

1.在 /etc/security/limits.conf 中增加一行

```shell
#<domain> <type> <item> <value>
*          soft    core unlimited
```

这里设置的是不限制 core 文件的大小，也可以设置成具体的数值，如 1024 表示生成的 core 文件最大是 1024k。

2.把`ulimit -c unlimited`这一行，加到 /etc/profile 文件中去，放到这个文件最后一行即可，然后执行`source /etc/profile`让配置立即生效。当然这只是对 root 用户，如果想仅仅作用于某一用户，可以把`ulimit -c unlimited`加到该用户对应的 ~/.bashrc 或 ~/.bash_profile 文件中去。加进去后记得`source /etc/profile    `或者`source ~/.bashrc `

生成的core文件的默认命名方式是：core.pid，其位置是崩溃程序所在目录，举个例子，比如某个程序当时运行时其进程 ID 是16663，那么如果其崩溃产生的 core 文件的名称是 core.16663。调试 core 文件的命令是： 

```shell
gdb filename corename
# 查看崩溃时的调用堆栈，进一步分析就能找到崩溃的原因
bt 
```

自定义 core 文件的名称和目录 **/proc/sys/kernel/core_uses_pid** 可以控制产生的 core 文件的文件名中是否添加 PID 作为扩 展，如果添加则文件内容为 1，否则为 0; **/proc/sys/kernel/core_pattern** 可以设置格式化的 core 文件保存位置或文件名。修改方式如下：

```shell
echo "/corefile/core-%e-%p-%t-%s" >> /proc/sys/kernel/core_pattern
# 或者在/etc/sysctl.conf中设置
vim /etc/sysctl.conf
# 加入下面这行
kernel.core_pattern=/corefile/core-%e-%p-%t-%s
# 刷新，使其同步到/proc/sys/kernel/core_pattern文件中
sysctl -p /etc/sysctl.conf
```

%e：程序文件的完整路径（路径中的/会被!替代） 

%p：添加 pid 到 core 文件名中

%t：进程奔溃的时间戳 

%s：哪个信号让进程奔溃

%h:  添加主机名到 core 文件名中

%u: 添加当前 uid 到 core 文件名中

%g: 添加当前 gid 到 core 文件名中

需要注意的是，您使用的用户必须对指定 core 文件目录具有写权限，否则生成时会因为权限不足而导致无法生成 core 文件。





