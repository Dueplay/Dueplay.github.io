---
title: Linux 网络编程基础
date: 2023-11-21
description: Linux 网络编程常用 socket 函数详解，包括 socket、bind、listen、accept、connect 等核心 API 的使用方法和注意事项。
categories: [Network]
---

网络编程是服务端开发的基础技能。本文详细介绍 Linux 下常用的 socket 函数及其使用方法。

## 1. 常用 Socket 函数

|   函数名称    |                 函数简单描述                 |    附加说明    |
| :-----------: | :------------------------------------------: | :------------: |
|    socket     |        创建某种类型(ipv4/v6)的套接字         |                |
|     bind      | 将一个 socket 绑定到一个 ip 与端口的二元组上 | 客户端也能bind |
|    listen     |          将一个 socket 变为侦听状态          |                |
|    connect    |            试图建立一个 TCP 连接             | 一般用于客户端 |
|    accept     |               尝试接收一个连接               | 一般用于服务端 |
|     send      |           通过一个 socket 发送数据           |                |
|     recv      |           通过一个socket 收取数据            |                |
|    select     |      判断一组 socket 上的读写和异常事件      |                |
| gethostbyname |             通过域名获取机器地址             |                |
|     close     |   关闭一个套接字，回收该 socket 对应的资源   |                |
|   shutdown    |            关闭 socket 收或发通道            |    单向关闭    |
|  setsockopt   |              设置一个套接字选项              |                |
|  getsockopt   |              获取一个套接字选项              |                |

## 查看函数文档

对于某个 socket 函数，如果你想查看它的用法，可以通过相应的帮助文档使用 `man` 命令：

- `man 1`：命令和可执行文件
- `man 2`：系统调用
- `man 3`：库函数
- `man 4`：特殊文件

```bash
# 查看 connect 的文档
man connect

# 查看 man 的文档
man man
```

## Socket 函数详解

### socket

创建套接字。Linux 中 socket 函数可以在创建时，直接通过标志位设置为非阻塞模式。

```c
socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0);

// 普通设置调用 fcntl
int flags = fcntl(sockfd, F_GETFL, 0);
fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);
```

**文档说明**：

```text
Since Linux 2.6.27, the type argument serves a second purpose: 
in addition to specifying a socket type, it may include the bitwise OR 
of any of the following values, to modify the behavior of socket():

SOCK_NONBLOCK   Set the O_NONBLOCK file status flag on the open file description.
                Using this flag saves extra calls to fcntl(2) to achieve the same result.

SOCK_CLOEXEC    Set the close-on-exec (FD_CLOEXEC) flag on the new file descriptor.
```

### connect

客户端连接服务器。

#### 查看和设置系统限制

```bash
ulimit -a              # 查看所有的选项，当前会话的
ulimit -c unlimited    # 修改 corefile 的 size
ulimit -n 65535        # 修改打开的 fd 最大数量
```

#### 异步/非阻塞 connect

将 fd 设置为非阻塞，不用去判断其返回值，过段时间用 IO 复用函数检测是否成功，判断其写事件，连接成功则 socket 是可写的。

**注意**：在 Linux 中，socketfd 一旦创建后就是可写的，除非出错了，还需要进一步判断。

**异步 connect 的好处**：节省阻塞的时间可以去做其他的事情，待连接成功后由 OS 通知我们。

#### 异步 connect 示例

```c++
#include <iostream>
#include <unistd.h>
#include <sys/select.h>
#include <sys/socket.h>
#include <sys/fcntl.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include <sys/types.h>

// 设置非阻塞
void SetNonBlocking(int fd) {
    int oldFlags = fcntl(fd, F_GETFL, 0);
    fcntl(fd, F_SETFL, oldFlags | O_NONBLOCK);
}

int asyncConnect(const char *hostname, int port, int timeout) {
    // 1. 创建 socket 设置非阻塞
    int sockfd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0);

    // 2. 连接服务器
    struct sockaddr_in serveraddr;
    serveraddr.sin_family = AF_INET;
    serveraddr.sin_port = htons(port);
    inet_pton(AF_INET, hostname, &serveraddr.sin_addr);
    
    for (;;) {
        int ret = connect(sockfd, (struct sockaddr *)&serveraddr, sizeof(serveraddr));
        if (ret == 0) {
            std::cout << "connect to server successfully" << std::endl;
            return sockfd;
        } else if (ret == -1) {
            // connect 被信号打断，重试 connect
            if (errno == EINTR) continue;
            else if (errno == EINPROGRESS) {
                // 连接正在进行中
                break;
            } else {
                // connect 出错
                close(sockfd);
                return -1;
            }
        } 
    }

    fd_set writeset;
    FD_ZERO(&writeset);
    FD_SET(sockfd, &writeset);
    struct timeval tv;
    tv.tv_sec = timeout;
    tv.tv_usec = 0;
    
    // 3. 调用 select 函数判断 socket 是否可写
    if (select(sockfd + 1, NULL, &writeset, NULL, &tv) != 1) {
        // 超时或者出错，具体判断 select 返回值，=0 超时返回，<0 出错
        std::cout << "select connect to server error" << std::endl;
        close(sockfd);
        return -1;
    }
    
    // 4. 调用 getsockopt 检测此时 sockfd 是否出错
    int err;
    socklen_t len = sizeof(err);
    if (getsockopt(sockfd, SOL_SOCKET, SO_ERROR, &err, &len) < 0) {
        // 出错
        perror("getsockopt");
        close(sockfd);
        return -1;
    }

    if (err == 0) {
        std::cout << "connect to server successfully" << std::endl;
        return sockfd;
    } else {
        std::cout << "connect to server error" << std::endl;
        close(sockfd);
        return -1;
    }
}
```

#### 为什么使用 getsockopt

在非阻塞模式下，调用 `connect` 函数通常会立即返回，并设置 `errno` 为 `EINPROGRESS`，表示连接正在进行。此时，连接操作没有完成，需要通过 `select` 或 `poll` 等函数来等待连接完成。

即使 `select` 函数指示文件描述符可写（意味着连接操作已完成），我们仍需要确认连接是否成功。这是**因为文件描述符可写并不一定表示连接成功，它可能表示连接操作完成，但结果可能是成功或失败**（例如，连接被拒绝或超时）。

使用 `getsockopt` 检查连接状态可以通过读取套接字的错误状态来确定连接的最终结果。

### bind

将套接字绑定到指定的 IP 和端口。

#### 本机 IP 地址

- **0.0.0.0**：如果 bind 的是 0.0.0.0，表示机器任意 IP，connect 可以选择这些 IP 中的任意一个去连接
- **127.0.0.1**：本地回环地址
- **192.168.x.x**：局域网 IP
- **公网 IP**：外网可访问的 IP

如果应用程序不关心 bind 绑定的 IP 地址，可以使用 `INADDR_ANY`（如果是 IPv6，则对应 `in6addr_any`），这样底层的协议栈服务会自动选择一个合适的 IP 地址。

**INADDR_ANY** 相当于地址 **0.0.0.0**。

#### 端口号

- **0 号端口**：表示让 OS 选一个随机的端口号，和不绑定一样
- **客户端也可以 bind 一个端口号**：正常情况下不指定，用 OS 分配的

### listen

将套接字变为监听状态。

```c
int listen(int sockfd, int backlog);
```

**参数 backlog**：最大**等待连接数**，可以用 OS 的宏 `SOMAXCONN` 来指定，`SOMAXCONN` 一般是 128。

#### 连接队列

- **全连接队列（已完成队列）**：三次握手完成等待 accept 的连接
- **半连接队列（SYN 队列）**：三次握手未完成等待三次握手建立的连接，三次握手成功后从半连接队列移动到全连接队列中

`backlog` 是两个队列的最大长度。

Linux 内核中，`backlog` 参数影响 `sk_accept_queue` 和 `sk_syn_queue`，分别对应全连接队列和半连接队列。

### accept

尝试接收一个连接。

#### 阻塞和非阻塞模式

**阻塞模式**：在没有连接到来的时候阻塞当前线程，有连接到来返回。

**非阻塞模式**：立刻返回，不管是否有新连接到来。在没有连接的情况返回 -1，判断 errno 是否是 `EAGAIN` 或 `EWOULDBLOCK`，表示 listenfd 被标记为非阻塞，并且当前不存在要接受的连接。有连接立即返回新连接。

#### Linux 扩展函数 accept4

```c
int accept4(int sockfd, struct sockaddr *addr, socklen_t *addrlen, int flags);
```

`flags` 参数可以一步到位将 accept 返回的客户端 fd 设置为非阻塞，默认是阻塞的。

#### accept 的一些错误码

- **ECONNABORTED**：对端放弃了连接
- **EINTR**：被信号中断
- **EMFILE**：当前调用 accept 的进程打开的文件数已经达到了限制
- **ENFILE**：当前调用 accept 的进程打开的文件数已经达到了系统的限制

当出现这个错误时：根据业务的大小判断是否需要机器扩容还是代码逻辑有问题，导致 fd 没有被回收。

可以在 accept 时记录一个当前连接数，当前连接数 +1 不超过最大的连接数时，再 accept 一个新连接，超过了就放弃这次连接。

### send/write/recv/read

发送和接收数据。

#### 阻塞模式

fd 是阻塞的，没有数据则阻塞。

#### 非阻塞模式

fd 设置为非阻塞模式，三种返回值：0、<0 和 >0

- **0**：read 返回 0 表示对端关闭连接
- **<0 && (EAGAIN 或 EWOULDBLOCK)**：表示操作不能立即完成，因为没有数据可供读取或没有空间可供写入。通常是由于文件描述符被设置为非阻塞模式，并且当前没有数据可供读取或没有空间可供写入。write 的话将数据存起来后面再试
- **<0 && EINTR**：被信号中断，应再次尝试
- **>0**：表示实际读取/写入的字节数

**注意**：write/send 不会发送 0 字节的数据，**send** 函数发送 **0** 字节数据，此时 send 函数返回 0，但网络协议栈并不会把这些数据发出去。

存在以下两种情形会让 send 函数的返回值为 0：

- 对端关闭了连接时，我们正好尝试调用 send 函数发送数据
- 本端尝试调用 send 函数发送 0 字节数据

而 recv 函数只有在对端关闭连接时才会返回 0，对端发送 0 字节，本端的 recv 函数是不会收到 0 字节数据的。

### close

关闭套接字。

**注意**：Windows 中关闭 socket 应该是调用 `closesocket`，而不是 `close` 函数，如果调用 `close` 程序会崩溃。

### 字节转换函数

- **h**：host
- **to**：->
- **n**：network
- **l**：long
- **s**：short

```c
htonl();  // 用于 IP，host to network long
htons();  // 用于 port，host to network short
ntohl();  // network to host long
ntohs();  // network to host short
```

#### inet_pton

将点分十进制 IP 地址转换为网络字节序的二进制形式。

#### gethostbyname

`gethostbyname(hostname)`：返回域名的 IP 地址列表，一般取第一个。

**注意**：多线程环境可能有问题，可以用 `gethostbyname_r` 替代。

### setsockopt

设置套接字选项。

#### 复用地址和端口号

```c
// 复用地址和端口号
int on = 1;
setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, (char *) &on, sizeof(on));
setsockopt(listenfd, SOL_SOCKET, SO_REUSEPORT, (char *) &on, sizeof(on));

// 或者
setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, (char *) &on, sizeof(on));
```

### 跨平台

跨平台网络编程时可以用统一的宏来定义 Linux/Windows 不同的 API 和返回值等。

## 2. IO 复用函数

服务端如何处理多个客户端 socket？一个线程处理一个。引入 IO 复用后，**用一个 IO 复用接口处理一组 socket，也就是用来方便处理一组 fd 的**。

IO 复用函数通过让 OS 内核检测绑定到其（IO 复用函数）上的 socket 读写事件来告诉用户某个 socket 是否可以读写。

- **Windows**：select
- **Linux**：select、poll、epoll 模型

### select

监听多个文件描述符的状态变化。

```c
int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout);
```

- **nfds**：监听的所有文件描述符中，最大文件描述符 +1
- **readfds**：读文件描述符集合
- **writefds**：写文件描述符集合
- **exceptfds**：异常文件描述符集合
- **timeout**：超时时间

### poll

类似 select，但没有最大文件描述符数量的限制。

```c
int poll(struct pollfd *fds, nfds_t nfds, int timeout);
```

### epoll

Linux 特有的高性能 IO 复用机制。

```c
// 创建 epoll 实例
int epoll_create(int size);

// 操作 epoll 实例
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);

// 等待事件
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

**epoll 的优势**：

- 没有文件描述符数量限制
- 不需要每次都传递整个文件描述符集合
- 事件驱动，只返回就绪的文件描述符

## 常见网络编程模型

### 单线程模型

一个线程处理所有连接，使用 IO 复用函数。

### 多线程模型

主线程 accept 连接，为每个连接创建一个工作线程处理。

### 线程池模型

主线程 accept 连接，将连接交给线程池中的工作线程处理。

### Reactor 模型

- 单 Reactor 单线程
- 单 Reactor 多线程
- 主从 Reactor 多线程

### Proactor 模型

异步 IO 模型，由 OS 完成 IO 操作，应用程序只需要处理业务逻辑。

## 总结

网络编程的核心是掌握：

- socket API 的正确使用
- 阻塞和非阻塞模式的区别
- IO 复用函数的选择
- 合适的网络编程模型

掌握这些基础知识，才能写出高性能的网络服务程序。
