---
title: "C++ RAII 资源管理惯用法"
date: 2024-12-03
categories: ["C++", "RAII", "资源管理"]
description: "详细介绍 C++ RAII（资源获取即初始化）惯用法的原理和应用场景，包括内存管理和锁管理"
---

在一些代码中，需要为了考虑出错情形的资源清理逻辑。

比如下面这段代码, 申请一段堆内存，在某个操作失败需要提前return时需要释放这个资源，否则就会内存泄露。

```
char *p = new char[1024];

if (操作1失败) {
	delete[] p;
	p = nullptr;
	return;
} 

if (操作2失败) {
	delete[] p;
	p = nullptr;
	return;
}

if (操作3失败) {
	delete[] p;
	p = nullptr;
	return;
}

delete[] p;
p = nullptr;
```

这种情形我们可以归纳成：**先分配资源，然后进行相关操作，在任一中间步骤中操作出错时对资源进行回收，如果中间步骤没有错误，我们在资源使用完毕之后也要回收相应的资源**

但是实际在编写这样的代码时太容易出错了，必须时刻保持警惕，在任何一个出错步骤中都要记得回收资源（实际中很容易忘记），同时造成了大量重复逻辑。

改进1：使用goto

```
char *p = new char[1024];

if (操作1失败) {
	goto cleanup;
} 

if (操作2失败) {
	goto cleanup;
}

if (操作3失败) {
	goto cleanup;
}
cleanup:
    delete[] p;
    p = nullptr;
```

一旦中间某个步骤出错，则跳转到统一的清理点处进行资源清理操作。

改进二：使用do...while(0)

```
char *p = new char[1024];
do {
	if (操作1失败) {
        break
    } 

    if (操作2失败) {
        break
    }

    if (操作3失败) {
       break
    }
}while (0);

delete[] p;
p = nullptr;
```

可以利用do...while(0)循环中的break特性巧妙地将资源回收操作集中到一个地方。

改进三：RAII

**RAII**是英文**R**esource **A**cquisition **I**s **I**nitialization的缩写，即"**资源获取就是初始化**"。通俗地说，所谓**RAII**就是资源在你拿到时就已经初始化好了，一旦你不再需要这个资源，该资源可以自动释放。

对于C++来说，即资源在构造函数中初始化（可以在构造函数中调用单独的初始化函数），在析构函数中释放或清理。

常见的情形就是在函数调用中，创建C++对象时分配资源，当对象出了作用域时会自动被清理和释放，即析构。（不管这个这个对象是如何出作用域的——中间某个步骤不满足提前return掉还是正常走完全部流程后 return）。

```
class HeapObjectWrapper {
public:
	HeapObjectWrapper(int size) {
	p_ = new char[size];
	}
	~HeapObjectWrapper() {
	delete[] p_;
	p = nullptr;
}
private:
	char* p_;
};

```

```
HeapObjectWrapper heapObj(1024);
if (操作1不成功)
	return;

if (操作2不成功)
	return;

if (操作3不成功)
	return;
```

heapObj对象一旦出了其作用域，会自动调用其析构函数释放堆内存。

RAII惯用法中的对资源的"分配"和"释放"的含义可以延伸出成各种外延和内涵来，如对多线程锁的获取和释放。

比如下面场景

```
void SomeFunction()
{
    获取某把锁；
    if (条件1)
    {
        if (条件2)
        {
            某些操作1
            释放锁;
            return;
        }
        else (条件3)
        {
            某些操作2
            释放锁;
            return;
        }
	}

    if (条件3)
    {
        某些操作3
        释放锁;
        return;
    }

    某些操作4
    释放锁;
}

```

为了避免死锁，我们必须在每个可能退出的分支上释放锁。随着逻辑写得越来越复杂，我们忘记在某个退出分支加上释放锁的代码的可能性也越来越大。而**RAII**惯用法正好解决了这个问题，我们可以将锁包裹成一个对象，在构造函数中获取锁，在析构函数中释放锁

```
class SomeLockGuard
{
public:
    SomeLockGuard()
    {
        //加锁
        m_lock.lock();
    }

    ~SomeLockGuard()
    {
        //解锁
        m_lock.unlock();
    }

private:
    SomeLock  m_lock;
};

void SomeFunction()
{
    SomeLockGuard lockWrapper;
    if (条件1)
    {
        if (条件2)
        {
            某些操作1
            return;
        }
        else (条件3)
        {
            某些操作2
            return;
        }
    }

    if (条件3)
    {
        某些操作3
        return;
    }

    某些操作4
}

```

这也是**std::lock_guard**和**boost::mutex::scoped_lock**的原理。
