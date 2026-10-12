---
title: 'C++ 面试常见问题与技巧'
date: 2024-12-03
categories: ['C++']
description: 'C++ 项目开发与调试中的实用技巧和常见问题解决方案'
---

## 快速上手一个 C/C++ 项目 -- 调试法

编译并用调试器 gdb 把程序运行起来，有参数记得 set args。

把程序中断下来 (Ctrl + C)，查看每个线程的调用关系，看相关代码。

### GDB 常用命令

```bash
gdb filename
gdb attach -p pid

# 查看线程
info threads

# 切换线程
thread threadno

# 查看线程堆栈
bt

# 切换到某个堆栈
frame N 

# 查看某个端口是否被占用
lsof -i -Pn | grep port
```

## 动态库需要提供的文件

### Windows

```cpp
// 隐式加载
*.h
*.lib // 声明
*.dll // 实现

// 显式加载，只需要 *.dll 
LoadLibrary("*.dll");
GetProcAddress(, "func_name");
```

### Linux

```cpp
// 隐式加载
*.h
*.so

// 显式加载，只需要 *.so
// man dlopen
dlopen()
```

## 定位 Bug

开发环境没问题，测试环境有复现几率不大的 bug，偶尔出现。

可以使用 **gdb 回放功能**。

## 客户端端口限制时如何进行 TCP 连接

bind 也能用于客户端。

### 客户端连接服务器的流程

```
1. 创建 socket
2. 调用 bind 函数给客户端指定一个端口
3. 调用 connect 函数连接指定的 ip 和 port
```

### nc 模拟客户端指定端口连接 

```bash
nc -v -p port 服务端ip 服务端port
```

## 判断字节序函数

### 字节序

大端 (Big Endian)，小端 (Little Endian)，有网络字节序（大端），主机字节序。

- **大端**：高位存放在内存低地址，低位存放在内存高地址。(**高低低高**)
- **小端**：高位存放在内存高地址，低位存放在内存低地址。(**高高低低**)

```cpp
int32_t a = 0x12345678;

// 函数实现原理:
// 将一个多字节的整型值拆成单字节，看低地址位是否是数值的高位（或低位）
// 低地址存放的是低位则为小端，存放高位则为大端

char b = *(char *)&a;
// b == 0x12 还是 0x78
```

## 异步 connect

```
1. 创建 socket
2. 设置 socket 为非阻塞
3. 调用 connect 函数，并且不用判断其返回值
4. 调用 IO 复用函数 (select, epoll) 判断 socket 是否可写

对于 Linux，在判断可写的情况下，需要再判断是否有错，
因为 socket 创建了就是可写的。
```

## Windows 程序单实例

一个 Windows 程序只能启动一个实例，例如：微信、杀毒软件等。

Windows 单例进程的实现原理，比如可以利用一个具名的内核变量，mutex、event 等，前一个程序启动了，后一个再去创建这个变量则失败。

## TCP 粘包问题，解包逻辑

```cpp
// socket 读事件触发收到数据后，调用下面函数
void XXSession::onRead() {
    while (true) {
        // 1. 判断收取的数据是否够一个包头大小，不够 continue，足够执行下一步
        // 2. 从接收缓冲区取出包头数据，解析得到包体大小，
        //    判断缓冲区是否够一个包体大小，不够 continue，够则执行下一步
        // 3. 解析包体得到业务数据，进行业务逻辑
        // 4. 业务逻辑处理完退出
    }
}
```

## nc 命令的使用

```bash
# 模拟一个服务器
nc -v -l ip port

# 模拟一个客户端
nc -v ip port

# 客户端以指定的端口号去连接
nc -v -p port 服务端ip 服务端port

# 服务端多次连接不退出
nc -k -v -l ip port
```

### 其他常见网络命令

```
ifconfig/ipconfig
ping
telnet
netstat
lsof
nc
tcpdump
```

## epoll 水平模式和边缘模式在收发数据时的差异

**水平模式**可以在每次读事件触发时，按需收取需要的字节数量；

**边缘模式**在每次读事件触发时，必须要把数据收完，调用 recv/read 函数，函数返回 -1 并且 errno 为 EWOULDBLOCK，才表明数据收完。

比如：服务端采用边缘模式，如果在 socket 读事件触发后每次只固定收取 5k 大小的数据，这是不行的，因为客户端可能发送 10k 的数据过来，由于是 edge 模式，没收取完该 socket 也不会再触发读事件了。

发数据发送不出去时，应该把数据放在发送缓冲区的尾部，下次写事件触发时，从首部依次读取数据，发送。

**水平模式**，一旦注册了写事件，数据发完后，要立即移除写事件，不然会一直触发，浪费 CPU 资源，因为只要条件（比如文件描述符可写）满足，事件就会持续触发，即使没有实际的数据需要写入；

**边缘模式**可以不移除，下次需要监听写事件时，再次注册写事件，因为事件只在状态从不可写变为可写时触发一次，即状态变化时触发一次，如果数据发送完后，没有立即移除写事件，事件也不会重复触发，直到状态再次变化。

## Linux Server 端对 SIGPIPE 信号的处理方法

考虑这样的场景：

```
1. A 与 B 正常连接
2. B 关闭了连接
3. A 发送数据，A 的 send 或者 write 函数返回 n，如果 n=0，则对端关闭了连接，
   如果 >0，A 的报文到了 B 端之后，B 回应一个 RST 报文
4. A 的逻辑是继续调用 send/write 函数，A 程序就 crash
   (此时 send/write 函数由于 B 端的关闭，会产生一个 SIGPIPE 信号，
   OS 默认处理这个信号就是让程序退出)
```

### 解决方法

```cpp
// 方法 1: 程序入口忽略这个信号，对于所有 socket 都生效
int main() {
    signal(SIGPIPE, SIG_IGN);
}

// 方法 2: 使用 MSG_NOSIGNAL 标志
int n = send(socket, buf, buflen, MSG_NOSIGNAL);
if (n == -1 && errno == EPIPE) {
    // 处理连接关闭
}
```

### 调试工具

不用 gdb 可以用 pstack 打印堆栈：

```bash
pstack pid
```
