---
title: Linux 线程编程详解
date: 2023-11-19
description: Linux 线程的基本概念、创建方法、线程 ID 获取以及常见问题解析，包括 pthread 库和 C++11 std::thread 的使用。
categories: [System]
---

线程是操作系统调度的最小单位，是进程中实际执行代码的实体。掌握线程编程是系统开发的基础技能。

## 线程基本概念

一个"**进程**"代表计算机中实际跑起来的一个程序，在现代操作系统的保护模式下，每个进程拥有自己独立的进程地址空间和上下文堆栈。但是就一个程序本身执行的操作来说，进程其实什么也不做（不执行任何进程代码），它只是提供一个大环境容器，在进程中实际的执行体是"**线程**"。

线程是进程中实际执行代码的最小单元，它由操作系统安排调度（何时启动、何时运行和暂停以及何时消亡）。

**一个进程至少得有一个线程**，我们把这个线程称之为**主线程**。

### 主线程退出，支线程也将退出吗？

#### Windows 系统

当一个进程存在多个线程时，如果主线程执行结束了，那么这个时候即使支线程（也可以叫**工作线程**）还没完成相关的代码执行，支线程也会退出，也就是说，主线程一旦退出整个进程也就结束了。

解决这一问题的方案很多，核心就是让主线程不要退出，或者至少在工作线程完成工作之前主线程不要退出。常见的解决方案有：
- 主线程启动一个循环
- 主线程等待工作线程退出后再退出

#### Linux 系统

如果主线程退出，工作线程一般不会受到影响，还会继续运行下去，但是此时这个进程就会变成所谓的**僵尸进程**，这是一种不好的做法，实际开发中应该避免产生僵尸进程。

```bash
# ps -ef 命令查看系统进程列表时，带有 <defunct> 字样的进程即僵尸进程
ps -ef | grep defunct
```

### 某个线程崩溃，会导致进程退出吗？

这是一个常见的面试题，还有一种问法是：**进程中某个线程崩溃，是否会对其他线程造成影响？**

一般来说，每个线程都是独立执行的单位，每个线程都有自己的上下文堆栈，一个线程的崩溃不会对其他线程造成影响。

但是通常情况下，一个线程崩溃会产生一个进程内的错误，例如在 Linux 操作系统中，可能会产生一个 **Segment Fault** 错误，这个错误会产生一个信号，操作系统默认对这个信号的处理就是结束进程，整个进程都被销毁了，这样的话这个进程中存在的其他线程自然也就不存在了。

## 线程的创建

### Linux pthread_create

Linux 平台上使用 pthread 库中 **pthread_create** 这个 API 来创建线程，其函数签名如下：

```c
int pthread_create(pthread_t *thread, 
                   const pthread_attr_t *attr,
                   void *(*start_routine) (void *), 
                   void *arg);
```

#### 参数说明

- **thread**：输出参数，如果线程创建成功，通过这个参数可以得到创建成功的线程 ID
- **attr**：指定了该线程的属性，一般设置为 NULL，表示使用默认属性，属性可以指定线程堆栈等信息
- **start_routine**：指定了线程函数，这个函数的调用方式必须是 **__cdecl** 调用，这是 C/C++ 中定义函数时默认的调用方式
- **arg**：通过这一参数可以在创建线程时将某个参数传入线程函数中，由于这是一个 **void*** 类型，可以方便我们最大化地传入任意多的信息给线程函数

#### 返回值

- 如果成功创建线程，返回 **0**
- 如果创建失败，则返回相应的错误码，常见的错误码有 **EAGAIN**、**EINVAL**、**EPERM**

#### 示例代码

```c
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

void* threadfunc(void* arg) {
    while (1) {
        sleep(1);
        printf("I am New Thread!\n");
    }
    return NULL;
}

int main() {
    pthread_t threadid;
    pthread_create(&threadid, NULL, threadfunc, NULL);
    
    // 等待线程结束
    pthread_join(threadid, NULL);
    
    return 0;
}
```

### C++11 std::thread 类

无论是 Linux 还是 Windows 上创建线程的 API，都有一个非常不方便的地方，就是线程函数的签名必须是固定的格式（参数个数和类型、返回值类型都有要求）。

C++11 新标准引入了一个新的类 **std::thread**（需要包含头文件 `<thread>`），使用这个类可以将任何签名形式的函数作为线程函数。

```cpp
#include <stdio.h>
#include <thread>

void threadproc1() {
    while (true) {
        printf("I am New Thread 1!\n");
    }
}

void threadproc2(int a, int b) {
    while (true) {
        printf("I am New Thread 2!\n");
    }
}

int main() {
    // 创建线程 t1
    std::thread t1(threadproc1);
    
    // 创建线程 t2
    std::thread t2(threadproc2, 1, 2);

    // 让主线程不要提前退出
    while (true) {
    }
    
    return 0;
}
```

### std::thread 使用注意事项

**std::thread** 在使用上容易犯一个错误，即 **std::thread** 对象在线程函数运行期间必须是有效的。

#### 错误示例

```cpp
#include <stdio.h>
#include <thread>

void threadproc() {
    while (true) {
        printf("I am New Thread!\n");
    }
}

void func() {
    std::thread t(threadproc);
}

int main() {
    func();
    
    // 让主线程不要提前退出
    while (true) {
    }
    
    return 0;
}
```

上述代码在 **main** 函数中调用 **func** 函数，在 **func** 函数中创建了一个线程，乍一看代码好像没什么问题，但是实际运行时程序会产生崩溃。

崩溃的原因是，当 **func** 函数调用结束后，**func** 中局部变量 **t**（**线程对象**）被销毁了，而此时**线程函数**仍然在运行。

#### 解决方法 1：detach

**std::thread** 对象提供了一个 **detach** 方法，这个方法让**线程对象**与**线程函数**脱离关系，这样即使**线程对象**被销毁，仍然不影响**线程函数**的运行。

```cpp
void func() {
    std::thread t(threadproc);
    t.detach();
}
```

然而，在实际开发中，并不推荐这么做，原因是我们可能需要使用**线程对象**去控制和管理线程的运行和生命周期。

#### 解决方法 2：保证线程对象有效

所以，我们的代码应该尽量保证**线程对象**在线程运行期间有效，而不是单纯地调用 **detach** 方法使线程对象与线程函数的运行分离。

## 线程 ID

一个线程创建成功以后，我们可以拿到一个线程 ID，线程 ID 在整个操作系统范围内是唯一的。

我们可以使用线程 ID 来标识和区分线程，例如在日志文件中，输出日志的同时将输出日志的线程 ID 一起输出，这样可以方便我们判断和排查问题。

### Linux 获取线程 ID

#### 方法一：pthread_create

调用 **pthread_create** 函数时，第一个参数在函数调用成功后可以得到线程 ID：

```c
#include <pthread.h>

pthread_t tid;
pthread_create(&tid, NULL, thread_proc, NULL);
```

#### 方法二：pthread_self

在需要获取 ID 的线程中调用 **pthread_self()** 函数获取：

```c
#include <pthread.h>

pthread_t tid = pthread_self();
```

**pthread_t** 是一个 32 位无符号整型值（在某些系统上是 64 位）。

#### 方法三：系统调用

通过系统调用获取线程 ID：

```c
#include <sys/syscall.h>
#include <unistd.h>

int tid = syscall(SYS_gettid);
```

### 线程 ID 的本质

**方法一**和**方法二**获取的线程 ID 结果是一样的，这是一个 **pthread_t** 类型，输出时本质上是一块内存空间地址，struct pthread 的起始地址。

由于不同的进程可能有同样地址的内存块，因此**方法一**和**方法二**获取的线程 ID 可能不是全系统唯一的，一般是一个很大的数字（内存地址）。

而**方法三**获取的线程 ID 是系统范围内全局唯一的，一般是一个不会太大的整数，这个数字也就是所谓的 **LWP**（Light Weight Process，轻量级进程，早期的 Linux 系统的线程是通过进程来实现的，这种线程被称为轻量级进程）的 ID。

### C++11 获取线程 ID

C++11 的线程库可以使用 **std::this_thread** 类的 **get_id** 获取当前线程的 ID，这是一个类静态方法。

当然也可以使用 **std::thread** 的 **get_id** 获取指定线程的 ID，这是一个类实例方法。

但是 **get_id** 方法返回的是一个包装类型为 **std::thread::id** 的对象，不可以直接强转成整型。

```cpp
#include <iostream>
#include <thread>
#include <sstream>

int main() {
    std::thread::id main_thread_id = std::this_thread::get_id();
    
    // 先将 std::thread::id 转换成 std::ostringstream 对象
    std::ostringstream oss;
    oss << main_thread_id;
    
    // 再将 std::ostringstream 对象转换成 std::string
    std::string str = oss.str();
    std::cout << "main thread id: " << str << std::endl;
    
    // 最后将 std::string 转换成整型值
    unsigned long long threadid = std::stoull(str);
    std::cout << "thread id as number: " << threadid << std::endl;
    
    return 0;
}
```

## pstack 命令

Linux 系统中可以通过 **pstack** 命令查看一个进程的线程数量和每个线程的调用堆栈情况。

```bash
pstack pid
```

**pid** 设置为要查看的进程的 ID 即可。

> 注意：**pstack** 命令查看的程序必须携带调试符号，且所使用的用户必须具有相应的查看权限。

### 利用 pstack 排查 CPU 使用率过高的问题

在实际开发中，我们经常需要去排查和定位一个进程 CPU 占用率过高的问题，可以使用 Linux **top** 和 **pstack** 命令结合使用来排查。

#### 步骤

1. **使用 top -H 查看线程**

```bash
top -H -p <pid>
```

top 命令的 `-H` 选项的作用是显示每个进程的各个线程运行状态（线程模式）。

2. **找出 CPU 占用率高的线程 ID**

在 top 输出中找到 CPU 使用率最高的线程 ID（这里显示的是十进制的线程 ID）。

3. **将线程 ID 转换为十六进制**

```bash
printf "%x\n" <thread_id>
```

4. **使用 pstack 查看线程堆栈**

```bash
pstack <pid> | grep <hex_thread_id> -A 20
```

在 pstack 输出的各个线程中，只要逐一对照我们的程序源码来梳理下该线程中是否有大多数时间都处于空转的逻辑，然后修改和优化这些逻辑就可以解决 CPU 使用率过高的问题了。

一般情况下，不工作的线程应尽量使用锁对象让其挂起，而不是空转，这样可以提高系统资源利用率。

## 等待线程结束

### pthread_join

Linux 下使用 **pthread_join** 等待线程结束：

```c
int pthread_join(pthread_t thread, void **retval);
```

- **thread**：要等待的线程 ID
- **retval**：输出参数，用于获取线程的返回值

```c
pthread_t tid;
pthread_create(&tid, NULL, threadfunc, NULL);

// 等待线程结束
void* ret;
pthread_join(tid, &ret);
```

### std::thread::join

C++11 中使用 **join** 方法：

```cpp
std::thread t(threadfunc);

// 等待线程结束
t.join();
```

## 总结

线程编程的核心要点：

- 理解线程与进程的关系
- 掌握线程的创建方法
- 正确管理线程对象的生命周期
- 了解线程 ID 的获取和使用
- 掌握线程调试和性能分析方法

线程是并发编程的基础，掌握线程编程是系统开发的必备技能。
