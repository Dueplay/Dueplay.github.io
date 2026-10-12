---
title: "Linux 网络编程完全指南"
date: 2024-12-03
categories: ['Linux', '网络编程', '系统编程']
description: '详细介绍 Linux 网络编程的核心知识，包括常用 socket 函数、IO 复用模型（select、poll、epoll）、阻塞与非阻塞、LT 与 ET 模式等实战技巧。'
---

## 1.常用socket函数

|   函数名称    |                 函数简单描述                 |    附加说明    |
| :-----------: | :------------------------------------------: | :------------: |
|    socket     |        创造某种类型(ipv4/v6)的套接字         |                |
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

对于某个 socket 函数，如果你想查看它的用法，可以通过相应的帮助文档，找man。

man 1 是命令和可执行文件

man 2 系统调用

man 3 库函数

man 4 特殊文件

```
# 查看connect的文档
man connect
# 查看man的文档
[root@localhost ~]# man man
   ## 无关的部分，省略...
   The table below shows the section numbers of the manual followed by the types of pages they contain.

   1   Executable programs or shell commands
   2   System calls (functions provided by the kernel)
   3   Library calls (functions within program libraries)
   4   Special files (usually found in /dev)
   5   File formats and conventions eg /etc/passwd
   6   Games
   7   Miscellaneous (including macro packages and conventions), e.g. man(7), groff(7)
   8   System administration commands (usually only for root)
   9   Kernel routines [Non standard]

   A manual page consists of several sections.
```

### socket

Linux中socket函数可以在创建时，直接通过标志位设置为非阻塞模式。

```c
socket(AF_INET, SOCK_STREAM| SOCK_NONBLOCK, 0);

// 普通设置调用fcntl
int flags = fcntl(sockfd, F_GETFL, 0);
fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);
```

文档：

```text
Since Linux 2.6.27, the type argument serves a second purpose: in addition to specifying a socket type, it may include the bitwise OR of any of the following values, to modify the behavior of socket():

SOCK_NONBLOCK   Set the O_NONBLOCK file status flag on the open file description (see open(2)) referred to by the new file descriptor.  Using this flag saves extra calls to fcntl(2) to achieve the same result.

SOCK_CLOEXEC    Set the close-on-exec (FD_CLOEXEC) flag on the new file descriptor.  See the description of the O_CLOEXEC flag in open(2) for reasons why this may be useful.
```

### connect

```shell
ulimit -a  # 查看所有的选项，当前回话的
ulimit -c unlimited # 修改corefile的size
ulimit -n 65535 # 修改打开的fd最大数量
```

异步/非阻塞connect，fd设置为非阻塞，不用去判断其返回值，过段时间用io复用函数检测是否成功，判断其写事件，连接成功则socket是可写的。

注意：在Linux中，socketfd一旦创建后就是可写的，除非出错了，还需要进一步判断

异步connect的好处：节省阻塞的时间可以去做其他的事情，待连接成功后由os通知我们。

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
    // 1.创建socket设置非阻塞
    int sockfd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0); //一步到位设置非阻塞

    // 2.连接服务器
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
            // connect 被信号打断，重试connect
            if (errno == EINTR) continue;
            else if (errno == EINPROGRESS) {
                //连接正在进行中
                break;
            }else {
                // connect出错
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
    // 3.调用select函数判断socket是否可写
    if (select(sockfd + 1, NULL, &writeset, NULL, &tv) != 1) {
        // 超时或者出错,具体判断select返回值， =0超时返回，<0出错
        std::cout << "select connect to server error" << std::endl;
        close(sockfd);
        return -1;
    }
    // 4.调用getsockopt检测此时sockfd是否出错
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

在非阻塞模式下，调用 `connect` 函数通常会立即返回，并设置 `errno` 为 `EINPROGRESS`，表示连接正在进行。此时，连接操作没有完成，需要通过 `select` 或 `poll` 等函数来等待连接完成。

为什么使用 `getsockopt`

即使 `select` 函数指示文件描述符可写（意味着连接操作已完成），我们仍需要确认连接是否成功。这是**因为文件描述符可写并不一定表示连接成功，它可能表示连接操作完成，但结果可能是成功或失败（例如，连接被拒绝或超时**）。使用 `getsockopt` 检查连接状态可以通过读取套接字的错误状态来确定连接的最终结果。

### bind

本机ip有

0.0.0.0：如果bind的是0.0.0.0，表示机器任意ip，connect可以选择这四个任意去连接。

127.0.0.1

192.168.101.7

公网ip

```text
如果应用程序不关心bind绑定的ip地址，可以使用INADDR_ANY(如果是IPv6，则对应in6addr_any)，
这样底层的（协议栈）服务会自动选择一个合适的ip地址，这样使在一个有多个网卡机器上选择ip地址问题变得简单。
```

**INADDR_ANY** 相当于地址 **0.0.0.0**

port：

绑定0号端口表示让os选一个随机的端口号，和不绑定一样。

客户端也可以bind一个端口号。正常不指定用os分配的

### listen

参数backlog：最大**等待连接数**，可以用os的宏SOMAXCONN来指定，SOMAXCONN一般是128。

```
全连接队列(已完成队列)：三次握手完成等待accept的连接
半连接队列(SYN队列)：三次握手未完成等待三次握手建立的连接，三次握手成功后从半连接队列移动到全连接队列中。
backlog是两队列队列的最大长度。
Linux 内核中，backlog 参数影响 sk_accept_queue 和 sk_syn_queue，分别对应全连接队列和半连接队列。
```

