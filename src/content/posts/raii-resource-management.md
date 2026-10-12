---
title: RAII 资源管理惯用法
date: 2023-11-20
description: 深入理解 C++ 中的 RAII（Resource Acquisition Is Initialization）设计模式，学习如何通过对象生命周期管理资源，避免内存泄漏和资源泄露。
categories: [C++]
---

在一些代码中，需要为了考虑出错情形的资源清理逻辑。

## 问题场景

比如下面这段代码，申请一段堆内存，在某个操作失败需要提前 return 时需要释放这个资源，否则就会内存泄露。

```cpp
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

这种情形我们可以归纳成：**先分配资源，然后进行相关操作，在任一中间步骤中操作出错时对资源进行回收，如果中间步骤没有错误，我们在资源使用完毕之后也要回收相应的资源。**

但是实际在编写这样的代码时太容易出错了，必须时刻保持警惕，在任何一个出错步骤中都要记得回收资源（实际中很容易忘记），同时造成了大量重复逻辑。

## 改进方案

### 改进1：使用 goto

```cpp
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

### 改进2：使用 do...while(0)

```cpp
char *p = new char[1024];
do {
    if (操作1失败) {
        break;
    } 

    if (操作2失败) {
        break;
    }

    if (操作3失败) {
       break;
    }
} while (0);

delete[] p;
p = nullptr;
```

可以利用 do...while(0) 循环中的 break 特性巧妙地将资源回收操作集中到一个地方。

### 改进3：RAII（最佳实践）

**RAII** 是英文 **R**esource **A**cquisition **I**s **I**nitialization 的缩写，即"**资源获取就是初始化**"。通俗地说，所谓 **RAII** 就是资源在你拿到时就已经初始化好了，一旦你不再需要这个资源，该资源可以自动释放。

对于 C++ 来说，即资源在构造函数中初始化（可以在构造函数中调用单独的初始化函数），在析构函数中释放或清理。

常见的情形就是在函数调用中，创建 C++ 对象时分配资源，当对象出了作用域时会自动被清理和释放，即析构。（不管这个对象是如何出作用域的——中间某个步骤不满足提前 return 掉还是正常走完全部流程后 return）。

```cpp
class HeapObjectWrapper {
public:
    HeapObjectWrapper(int size) {
        p_ = new char[size];
    }
    ~HeapObjectWrapper() {
        delete[] p_;
        p_ = nullptr;
    }
private:
    char* p_;
};
```

使用方式：

```cpp
HeapObjectWrapper heapObj(1024);
if (操作1不成功)
    return;

if (操作2不成功)
    return;

if (操作3不成功)
    return;
```

heapObj 对象一旦出了其作用域，会自动调用其析构函数释放堆内存。

## RAII 在锁管理中的应用

RAII 惯用法中的对资源的"分配"和"释放"的含义可以延伸出成各种外延和内涵来，如对多线程锁的获取和释放。

### 问题场景

```cpp
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

为了避免死锁，我们必须在每个可能退出的分支上释放锁。随着逻辑写得越来越复杂，我们忘记在某个退出分支加上释放锁的代码的可能性也越来越大。

### RAII 解决方案

**RAII** 惯用法正好解决了这个问题，我们可以将锁包裹成一个对象，在构造函数中获取锁，在析构函数中释放锁：

```cpp
class SomeLockGuard
{
public:
    SomeLockGuard()
    {
        // 加锁
        m_lock.lock();
    }

    ~SomeLockGuard()
    {
        // 解锁
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

这也是 **std::lock_guard** 和 **boost::mutex::scoped_lock** 的原理。

## RAII 的优点

1. **自动化资源管理**：资源的获取和释放由对象生命周期自动管理
2. **异常安全**：即使发生异常，析构函数仍会被调用，确保资源释放
3. **代码简洁**：避免大量重复的资源释放代码
4. **防止遗漏**：编译器保证析构函数会被调用，不会忘记释放资源

## C++ 标准库中的 RAII 应用

- **std::unique_ptr / std::shared_ptr**：自动管理动态内存
- **std::lock_guard / std::unique_lock**：自动管理互斥锁
- **std::fstream**：自动关闭文件
- **std::vector / std::string**：自动管理内部缓冲区

## 总结

RAII 是 C++ 中最重要的编程惯用法之一，它将资源管理与对象生命周期绑定，通过构造函数获取资源，通过析构函数释放资源。这种方式不仅简化了代码，还提高了程序的安全性和可靠性，是现代 C++ 编程的基石。
