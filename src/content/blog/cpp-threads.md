---
title: "C++ 多线程编程详解"
pubDate: 2024-12-03
categories: ['C++', '多线程', '系统编程']
description: '深入讲解 C++ 多线程编程的核心概念，包括线程创建、线程 ID、线程同步、线程局部存储等，涵盖 Linux pthread 和 C++11 标准库的使用方法。'
---

# 线程

### 线程基本概念

一个"**进程**"代表计算机中实际跑起来的一个程序，在现代操作系统的保护模式下，每个进程拥有自己独立的进程地址空间和上下文堆栈。但是就一个程序本身执行的操作来说，进程其实什么也不做（不执行任何进程代码），它只是提供一个大环境容器，在进程中实际的执行体是"**线程**"。

线程是进程中实际执行代码的最小单元，它由操作系统安排调度（何时启动、何时运行和暂停以及何时消亡）。

**一个进程至少得有一个线程**，我们把这个线程称之为**主线程**。

#### 主线程退出，支线程也将退出吗？

在**Windows**系统中，当一个进程存在多个线程时，如果主线程执行结束了，那么这个时候即使支线程（也可以叫**工作线程**）还没完成相关的代码执行，支线程也会退出，也就是说，主线程一旦退出整个进程也就结束了。解决这一问题的方案很多，核心就是让主线程不要退出，或者至少在工作线程完成工作之前主线程不要退出。常见的解决方案有主线程启动一个循环或者主线程等待工作线程退出后再退出。

在**Linux**系统中，如果主线程退出，工作线程一般不会受到影响，还会继续运行下去，但是此时这个进程就会变成所谓的**僵尸进程**，这是一种不好的做法，实际开发中应该避免产生僵尸进程。

```text
# ps -ef 命令查看系统进程列表时，带有<defunct>字样的进程即僵尸进程
```

#### 某个线程崩溃，会导致进程退出吗？

这是一个常见的面试题，还有一种问法是：**进程中某个线程崩溃，是否会对其他线程造成影响？**

一般来说，每个线程都是独立执行的单位，每个线程都有自己的上下文堆栈，一个线程的崩溃不会对其他线程造成影响。但是通常情况下，一个线程崩溃会产生一个进程内的错误，例如在Linux操作系统中，可能会产生一个**Segment Fault**错误，这个错误会产生一个信号，操作系统默认对这个信号的处理就是结束进程，整个进程都被销毁了，这样的话这个进程中存在的其他线程自然也就不存在了。

### 线程的创建

#### Linux 线程创建

Linux平台上使用pthread库中**pthread_create**这个API来创建线程，其函数签名如下：

```text
int pthread_create(pthread_t *thread, 
				   const pthread_attr_t *attr,
                   void *(*start_routine) (void *), 
                   void *arg);

void* threadfunc(void* arg)
{
	while (1)
	{
		sleep(1);

		printf("I am New Thread!\n");
	}

	return NULL;
}
pthread_create(&threadid, NULL, threadfunc, NULL);
```

- 参数**thread**，是一个输出参数，如果线程创建成功，通过这个参数可以得到创建成功的线程ID。
- 参数**attr**指定了该线程的属性，一般设置为NULL，表示使用默认属性， 属性可以指定线程堆栈等信息。
- 参数**start_routine**指定了线程函数，这里需要注意的是这个函数的调用方式必须是**__cdecl**调用，这是C/C++中定义函数时默认的调用方式。

 也就是说，如下函数的调用方式是等价的：

```text
//代码片段1：不显式指定函数调用方式，其调用方式为默认的__cdecl
void* start_routine (void* args)
{
}

//代码片段2：显式指定函数调用方式为默认的__cdecl，等价于代码片段1
void* __cdecl start_routine (void* args)
{
}
```

- 数**arg**，通过这一参数可以在创建线程时将某个参数传入线程函数中，由于这是一个**void***类型，可以方便我们最大化地传入任意多的信息给线程函数。
- 返回值：如果成功创建线程，返回**0**；如果创建失败，则返回响应的错误码，常见的错误码有**EAGAIN**、**EINVAL**、**EPERM**。

#### C++11提供的std::thread类

无论是Linux还是Windows上创建线程的API，都有一个非常不方便的地方，就是线程函数的签名必须是固定的格式（参数个数和类型、返回值类型都有要求）。C++11新标准引入了一个新的类**std::thread**（需要包含头文件<thread>），使用这个类可以将任何签名形式的函数作为线程函数。以下代码分别创建两个线程，线程函数签名不一样：

```text
#include <stdio.h>
#include <thread>

void threadproc1()
{
    while (true)
    {
        printf("I am New Thread 1!\n");
    }
}

void threadproc2(int a, int b)
{
    while (true)
    {
        printf("I am New Thread 2!\n");
    }
}

int main()
{
    //创建线程t1
    std::thread t1(threadproc1);
    //创建线程t2
    std::thread t2(threadproc2, 1, 2);

	//让主线程不要提前退出
    while (true)
    {
    }
    
    return 0;
}
```

当然， **std::thread**在使用上容易犯一个错误，即**std::thread**对象在线程函数运行期间必须是有效的。比如

```text
#include <stdio.h>
#include <thread>

void threadproc()
{
    while (true)
    {
        printf("I am New Thread!\n");
    }
}

void func()
{
    std::thread t(threadproc);
}

int main()
{
    func();
    
    //让主线程不要提前退出
    while (true)
    {
    }
    
    return 0;
}
```

上述代码在**main**函数中调用**func**函数，在**func**函数中创建了一个线程，乍一看代码好像没什么问题，但是实际运行时程序会产生崩溃。崩溃的原因是，当**func**函数调用结束后，**func**中局部变量**t**（**线程对象**）被销毁了，而此时**线程函数**仍然在运行。使用**std::thread**类时，**必须保证线程函数运行期间，其线程对象有效**。这是一个很容易犯的错误，解决这个问题的方法是，**std::thread**对象提供了一个**detach**方法，这个方法让**线程对象**与**线程函数**脱离关系，这样即使**线程对象**被销毁，仍然不影响**线程函数**的运行。我们只需要在**func**函数中调用**detach**方法即可，代码如下：

```text
void func()
{
    std::thread t(threadproc);
    t.detach();
}
```

然而，在实际开发中，并不推荐这么做，原因是我们可能需要使用**线程对象**去控制和管理线程的运行和生命周期。所以，我们的代码应该尽量保证**线程对象**在线程运行期间有效，而不是单纯地调用**detach**方法使线程对象与线程函数的运行分离。

### 线程ID

一个线程创建成功以后，我们可以拿到一个线程ID，线程ID是在整个操作系统范围内是唯一的。我们可以使用线程ID来标识和区分线程，例如在日志文件中，输出日志的同时将输出日志的线程ID一起输出，这样可以方便我们判断和排查问题。创建线程时可以通过**pthread_create**函数的第一个参数**thread** （Linux平台）得到线程的ID。大多数时候，我们需要在当前调用线程中获取当前线程的ID，在Linux平台上可以调用**pthread_self**函数

```text
pthread_t pthread_self(void);
```

pthread_t是一个32位无符号整型值。

#### pstack命令

Linux系统中可以通过**pstack**命令查看一个进程的线程数量和每个线程的调用堆栈情况。

```text
pstack pid
```

**pid**设置为要查看的进程的ID即可

> 注意：**pstack**命令查看的程序必须携带调试符号，且所使用的用户必须具有相应的查看权限。

#### 利用pstack命令排查Linux进程CPU使用率过高的问题

在实际开发中，我们经常需要去排查和定位一个进程CPU占用率过高的问题，如何排查呢？这里可以使用Linux **top**和**pstack**命令结合使用来排查。

> top命令的-H选项的作用是显示每个一个进程的各个线程运行状态（线程模式）。top命令第一栏虽然输出还叫PID，但此时显示的实际是每个线程的线程ID

在pstack输出的各个线程中，只要逐一对照我们的程序源码来梳理下该线程中是否有大多数时间都处于空转的逻辑，然后修改和优化这些逻辑就可以解决CPU使用率过高的问题了，一般情况下，不工作的线程应尽量使用锁对象让其挂起，而不是空转，这样可以提高系统资源利用率

#### Linux系统线程ID的本质

Linux系统中有三种方式可以获取一个线程的ID：

**方法一**

调用**pthread_create**函数时，第一个参数在函数调用成功后可以得到线程ID：

```text
#include <pthread.h>

pthread_t tid;
pthread_create(&tid, NULL, thread_proc, NULL);
```

**方法二**

在需要获取ID的线程中调用**pthread_self()**函数获取。

```text
#include <pthread.h>

pthread_t tid = pthread_self();
```

**方法三**

通过系统调用获取线程ID。

```text
#include <sys/syscall.h>
#include <unistd.h>

int tid = syscall(SYS_gettid);
```

**方法一**和**方法二**获取的线程ID结果是一样的，这是一个**pthread_t**类型，输出时本质上是一块内存空间地址, struct pthread的起始地址。

由于不同的进程可能有同样地址的内存块，因此**方法一**和**方法二**获取的线程ID可能不是全系统唯一的，一般是一个很大的数字（内存地址）。而**方法三**获取的线程ID是系统范围内全局唯一的，一般是一个不会太大的整数，这个数字也是就是所谓的LWP （Light Weight Process，轻量级进程，早期的Linux系统的线程是通过进程来实现的，这种线程被称为轻量级进程）的ID。

#### C++11的获取当前线程ID的方法

C++11的线程库可以使用**std::this_thread**类的**get_id**获取当前线程的ID，这是一个类静态方法。

当然也可以使用**std::thread**的**get_id**获取指定线程的ID，这是一个类实例方法。

但是**get_id**方法返回的是一个包装类型为**std::thread::id**的对象，不可以直接强转成整型，C++11线程库也没有为该对象提供任何转换成整型的接口。所以，我们一般使用**std::cout**这样的输出流来输出，或者先转换为**std::ostringstream**对象，再转换成字符串类型，然后把字符串类型转换成我们需要的整型。这一点，算是C++11线程库获取线程ID一个不太方便的地方。

```text
	//先将std::thread::id转换成std::ostringstream对象
    std::ostringstream oss;
    oss << main_thread_id;
    //再将std::ostringstream对象转换成std::string
    std::string str = oss.str();
    std::cout << "main thread id: " << str << std::endl;
    //最后将std::string转换成整型值
    unsigned long long threadid = std::stoull(str);

```

### 等待线程结束

####  Linux下等待线程结束

Linux线程库提供了**pthread_join**函数，用来等待某线程的退出并接收它的返回值。这种操作被称为**汇接**（join），**pthread_join**函数签名如下：

```text
int pthread_join(pthread_t thread, void** retval);
```

- 参数**thread**，需要等待的线程ID。
- 参数**retval**，输出参数，用于接收等待退出的线程的退出码（**Exit Code**），线程退出码可以通过调用**pthread_exit**退出线程时指定，也可以在线程函数中通过**return**语句返回。 **pthread_exit**函数的签名如下：

```text
#include <pthread.h>

void pthread_exit(void* value_ptr); 
```

参数**value_ptr**的值可以通过**pthread_join**函数的第二个参数得到，如果不需要使用这个参数，可以设置为NULL。

**pthread_join函数等待目标线程退出期间会挂起当前线程（调用pthread_join的线程）**，被挂起的线程处于等待状态，不会消耗任何CPU时间片。直到目标线程退出后，调用pthread_join的线程会被唤醒，继续执行接下来的逻辑。

#### C++11提供的等待线程结果函数

C++11的**std::thread**既然统一了Linux和Windows的线程创建函数，那么它应该也提供等待线程退出的接口，确实如此，**std::thread**的**join**方法就是用来等待线程退出的函数。当然使用这个函数时，必须保证该线程还处于运行中状态，也就是说等待的线程必须是可以"**join**" 的，**如果需要等待的线程已经退出，此时调用join方法，程序会产生崩溃**。因此，C++11的线程库同时提供了一个**joinable**方法来判断某个线程是否可以join，如果不确定当前线程是否可以"join"，可以先调用**joinable**函数判断一下是否可以"join"。

```text
std::thread t(FileThreadFunc);
    if (t.joinable())
        t.join();
```

### 线程函数传C++类实例指针惯用法

如果使用C++面向对象的方式对线程函数进行封装，那么线程函数就不能是类的实例方法，即必须是类的静态方法。那么，为什么不能是类的实例方法呢？我们以Linux的线程函数签名为例：

```text
void* threadFunc(void* arg);
```

假设我们将线程的基本功能封装到一个 **Thread** 类中，部分代码如下：

```text
class Thread
{
public:
    Thread();
    ~Thread();

    void start();
    void stop();

    void* threadFunc(void* arg);
};
```

由于**threadFunc**是一个类实例方法，无论是类的实例方法还是静态方法，C++编译器在编译时都会将这些函数"翻译"成全局函数，即去掉类的域限制。对于实例方法，为了保证类方法的正常功能，C++编译器在翻译时，会将类的实例对象地址（也就是this指针）作为第一个参数传递给该方法，也就是说，翻译后的**threadFunc**的签名变成了如下形式（伪代码）：

```text
void* threadFunc(Thread* this, void* arg);
```

这样的话，就不符合线程函数签名要求了。**因此如果使用类方法作为线程函数则只能是类的静态方法而不能是类的实例方法**。

当然，如果是使用C++11的**std::thread**类就没有这个限制，即使类成员函数是类的实例方法也可以，但是必须显式地将线程函数所属的类对象实例指针（在类的内部就是**this**指针）作为构造函数参数传递给**std::thread**，还是需要传递类的this指针，这在本质上是一样的。

综上所述，如果不使用C++11的语法，那么线程函数只能使用类的静态方法，且函数签名必须符合线程函数的签名要求。如果是类的静态方法，那么就没法访问类的实例方法了，为了解决这个问题，我们在实际开发中往往会在创建线程时将当前对象的地址（**this**指针）传递给线程函数，然后在线程函数中，将该指针转换成原来的类实例，再通过这个实例就可以访问类的所有方法了。

```text
pthread_create(&m_hThread,NULL,&_ThreadEntry , this); //使用显式的 &
pthread_create(&m_hThread,NULL,_ThreadEntry , this); // 隐式的函数指针转换

void* CThread::_ThreadEntry(void* pParam)
{
	CThread *pThread = (CThread *)pParam;
    
}
```

那么类的实例方法就一定不能作为线程函数了吗？不一定，在C++11语法中我们可以使用**std::bind**这一工具来给线程函数绑定一个this指针，这样就能使用类实例方法作为线程函数了，

### 线程局部储存

线程独有的：线程栈，TLS，线程ID，寄存器，信号屏蔽字，优先级

**堆内存是进程共享的资源**，所有线程都可以访问和操作堆中的数据



对于一个存在多个线程的进程来说，有时候我们需要有一份数据是每个线程都拥有一份的，也就是说每个线程自己操作自己的这份数据，这有点类似 C++ 类的实例属性，每个实例对象操作的都是自己的属性。我们把这样的数据称之为**线程局部存储**（**Thread Local Storage**，**TLS**），对应的存储区域叫做**线程局部存储区**。

#### Linux 的线程局部存储

Linux 系统上的 NPTL （Native POSIX Threads Library，NPTL is the GNU C library POSIX threads implementation that is used on modern Linux systems）提供了一套函数接口来实现线程局部存储的功能：

```text
int pthread_key_create(pthread_key_t* key, void (*destructor)(void*));
int pthread_key_delete(pthread_key_t key);

int pthread_setspecific(pthread_key_t key, const void* value);
void* pthread_getspecific(pthread_key_t key);
```

**pthread_key_create** 函数调用成功会返回 0 值，调用失败返回非 0 值，函数调用成功会为线程局部存储创建一个新键，用户通过参数 **key** 去设置（调用 **pthread_setspecific**）和获取（**pthread_getspecific**）数据，因为进程中的所有线程都可以使用返回的键，所以参数 **key** 应该指向一个全局变量。

参数 **destructor** 是一个自定义函数指针，其签名是：

```text
void* destructor(void* value)
{
    /*多是为了释放value指针指向的资源*/
}
```

线程终止时，如果 key 关联的值不是 NULL，那么 NTPL 会自动执行定义的 destructor 函数；如果无须析构，可以将 destructor 设置为 NULL。

#### C++ 11 的 thread_local 关键字

C++ 11 标准提供了一个新的关键字 **thread_local** 来定义一个线程变量。使用方法如下：

```text
thread_local int g_mydata = 1;
```

有了这个关键字，使用线程局部存储的代码就可以同时在 Windows 和 Linux 上运行了。示例如下：

```text
#include <thread>
#include <chrono>
#include <iostream>

thread_local int g_mydata = 1;

void thread_func1()
{
	while (true)
	{
		++g_mydata;
	}
}

void thread_func2()
{
	while (true)
	{
		std::cout << "g_mydata = " << g_mydata << ", ThreadID = " << std::this_thread::get_id() << std::endl;
		std::this_thread::sleep_for(std::chrono::seconds(1));
	}
}

int main()
{
	std::thread t1(thread_func1);
	std::thread t2(thread_func2);

	t1.join();
	t2.join();

	return 0;
}
```

注意：

- 对于线程变量，每个线程都会有该变量的一个拷贝，互不干扰，该局部变量一直都在，直到线程退出为止。
- 系统的线程局部存储区域内存空间并不大，所以尽量不要利用这个空间存储大的数据块，如果不得不使用大的数据块，可以将大的数据块存储在堆内存中，再将该堆内存的地址指针存储在线程局部存储区域。
