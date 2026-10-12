---
title: C++ 智能指针详解
date: 2023-11-20
description: 深入理解 C++ 智能指针 unique_ptr、shared_ptr 和 weak_ptr 的使用方法、实现原理以及最佳实践，掌握现代 C++ 的内存管理。
categories: [C++]
---

智能指针是现代 C++ 中管理动态内存的核心工具，它们通过 RAII 机制自动管理资源，避免内存泄漏。

## unique_ptr

### 为什么需要智能指针

考虑下面的函数，这个函数在堆上分配了一个 Simple 对象，但是不释放这个对象，故意产生内存泄漏：

```cpp
void leaky() {
    Simple* mySimplePtr = new Simple(); // BUG! Memory is never released!
    mySimplePtr->go();
}
```

有时你可能认为，代码正确地释放了动态分配的内存。遗憾的是，这种想法几乎总是不正确的。比如这个函数：

```cpp
void couldBeLeaky() {
    Simple* mySimplePtr = new Simple();
    mySimplePtr->go();
    delete mySimplePtr;
}
```

上面的函数动态分配一个 Simple 对象，使用该对象，然后正确地调用 delete。但是，这个例子仍然可能产生内存泄漏！**如果 go 方法抛出一个异常，将永远不会调用 delete，导致内存泄漏。**

### unique_ptr 的使用

这两种情况下应使用 unique_ptr。对象不会显式删除，但实例 unique_ptr 离开作用域时（在函数的末尾，或者因为抛出了异常），就会在其析构函数中自动释放 Simple 对象：

```cpp
void notLeaky() {
    auto mySimpleSmartPtr = make_unique<Simple>();
    mySimpleSmartPtr->go();
}
```

这段代码使用 C++14 中的 make_unique 和 auto 关键字，所以只需要指定指针的类型。如果 Simple 构造函数需要参数，就把它们放在 make_unique() 调用的圆括号中。

如果编译器不支持 make_unique，可以这种方式创建：

```cpp
unique_ptr<Simple> p(new Simple());
```

### unique_ptr 的操作

像标准指针一样，仍可以使用 * 或 -> 对智能指针进行解引用。

**get() 方法**：可用于直接访问底层指针。这可将指针传递给需要普通指针的函数。

```cpp
void processData(Simple* simple) { /* Use the simple pointer... */ }

// 可采用如下方式进行调用:
auto mySimpleSmartPtr = make_unique<Simple>();
processData(mySimpleSmartPtr.get());
```

**reset() 方法**：可释放 unique_ptr 的底层指针，并使用 reset() 根据需要将其改成另一个指针。

```cpp
mySimpleSmartPtr.reset();                    // Free resource and set to nullptr
mySimpleSmartPtr.reset(new Simple());        // Free resource and set to a new Simple instance
```

**release() 方法**：可使用 release() 断开 unique_ptr 与底层指针的连接。release 方法返回资源的底层指针，然后将智能指针设为 nullptr。实际上，智能指针失去对资源的所有权，负责在你用完资源时释放资源。

```cpp
Simple* simple = mySimpleSmartPtr.release(); // Release ownership
// Use the simple pointer...
delete simple;
simple = nullptr;
```

### unique_ptr 与移动语义

由于 unique_ptr 代表唯一拥有权，因此无法复制它！使用 std::move() 移动语义将一个 unique_ptr 移到另一个。这用于显式移动所有权。

```cpp
class Foo
{
public:
    Foo(unique_ptr<int> data) : mData(move(data)) {}
private:
    unique_ptr<int> mData;
};

auto myIntSmartPtr = make_unique<int>(42);
Foo f(move(myIntSmartPtr));
```

### unique_ptr 与数组

unique_ptr 适用于存储动态分配的旧式 C 风格数组。下例创建了一个 unique_ptr 来保存动态分配的、包含 10 个整数的 C 风格数组：

```cpp
auto myVariableSizedArray = make_unique<int[]>(10);
```

### 自定义 deleter

默认情况下，unique_ptr 使用标准的 new 和 delete 运算符来分配和释放内存。可将此行为改成：

```cpp
int* malloc_int(int value) {
    int* p = (int*)malloc(sizeof(int));
    *p = value;
    return p;
}

int main() {
    unique_ptr<int, decltype(free)*> myIntSmartPtr(malloc_int(42), free);
    return 0;
}
```

这段代码使用 malloc_int() 给整数分配内存。unique_ptr 调用标准的 free 函数来释放内存。

unique_ptr 的自定义 deleter 的语法有些费解。需要将自定义 deleter 的类型指定为模板类型参数。decltype(free) 用于返回 free() 类型。模板类型参数应当是函数指针的类型，因此另外附加一个 *，如 `decltype(free)*`

**当 unique_ptr 离开作用域时，可自动关闭文件或网络套接字以及其他任何资源。**

## shared_ptr

### shared_ptr 的使用

shared_ptr 的用法与 unique_ptr 类似。要创建 shared_ptr，可使用 make_shared()，它比直接创建 shared_ptr 更高效。

**更高效原因**：

当使用 `std::make_shared` 创建 `shared_ptr` 时，所有需要的内存（包括对象本身和控制块）在一次分配中完成。这减少了内存分配的次数，从而提高了效率。

而直接使用 `std::shared_ptr` 构造函数创建对象通常需要两次内存分配，一次用于对象本身，一次用于控制块。

在直接使用 `new` 的情况下，在对象构造和控制块分配之间，如果对象构造抛出异常，可能会导致内存泄漏。而 `std::make_shared` 在分配和构造对象的过程中是异常安全的。

```cpp
auto mySimpleSmartPtr = make_shared<Simple>();
std::shared_ptr<Simple> ptr(new Simple());
```

### shared_ptr 的操作

与 unique_ptr 一样，shared_ptr 也支持 get 和 reset 方法。唯一的区别在于，当调用 reset 时，由于引用计数，仅在最后的 shared_ptr 销毁或重置时，才释放底层资源。

注意，shared_ptr 不支持 release。

**use_count() 方法**：可使用 use_count() 来检索共享同一资源的 shared_ptr 实例数量。

### 自定义 deleter

与 unique_ptr 类似，shared_ptr 默认情况下使用标准的 new 和 delete 运算符来分配和释放内存。可更改此行为：

```cpp
shared_ptr<int> myIntSmartPtr(malloc_int(42), free);
```

可以看到，不必将**自定义 deleter 的类型指定为模板类型参数**，这比 unique_ptr 的自定义 deleter 更简便。

### 自动关闭文件的示例

下面的示例使用 shared_ptr 存储文件指针。当 shared_ptr 离开作用域时，会调用 CloseFile 函数来自动关闭文件指针：

```cpp
void CloseFile(FILE* filePtr) {
    if (filePtr == nullptr)
        return;
    fclose(filePtr);
    cout << "File closed." << endl;
}

int main() {
    FILE* f = fopen("data.txt", "w");
    // 自定义 deleter
    shared_ptr<FILE> filePtr(f, CloseFile);
    if (filePtr == nullptr) {
        cerr << "Error opening file." << endl;
    } else {
        cout << "File opened." << endl;
    }
    // Use filePtr
    return 0;
}
```

### 双重删除的问题

如果要创建两个标准的 shared_ptr，并使它们都指向同一个 Simple 对象，如下面的代码所示，在销毁时，两个智能指针将尝试删除同一个对象：

```cpp
void doubleDelete() {
    Simple* mySimple = new Simple();
    shared_ptr<Simple> smartPtr1(mySimple);
    shared_ptr<Simple> smartPtr2(mySimple);  // 错误！
}
```

根据编译器，这段代码可能会崩溃！输出为：
```
Simple constructor called!
Simple destructor called!
Simple destructor called!
```

只调用一次构造函数，却调用两次析构函数！

**正确的做法**是不应该创建两个指向同一个对象的 shared_ptr，而是应该建立副本：

```cpp
void noDoubleDelete() {
    auto smartPtr1 = make_shared<Simple>();
    shared_ptr<Simple> smartPtr2(smartPtr1);  // 正确！
}
```

这段代码的输出：
```
Simple constructor called!
Simple destructor called!
```

即使有两个指向同一个 Simple 对象的 shared_ptr，Simple 对象也只销毁一次。

## weak_ptr

### weak_ptr 的作用

weak_ptr 可包含由 shared_ptr 管理的资源的引用。weak_ptr 不拥有这个资源，所以不能阻止 shared_ptr 释放资源。weak_ptr 销毁时（例如离开作用域时）不会销毁它指向的资源。然而，它可用于判断资源是否已经被关联的 shared_ptr 释放了。

### weak_ptr 的使用

weak_ptr 的构造函数要求将一个 shared_ptr 或另一个 weak_ptr 作为参数。

为了访问 weak_ptr 中保存的指针，需要将 weak_ptr 转换为 shared_ptr。有两种方法：

1. 使用 weak_ptr 实例的 lock 方法，这个方法返回一个 shared_ptr。如果同时释放了与 weak_ptr 关联的 shared_ptr，返回的 shared_ptr 是 nullptr
2. 创建一个新的 shared_ptr 实例，将 weak_ptr 作为 shared_ptr 构造函数的参数。如果释放了与 weak_ptr 关联的 shared_ptr，将抛出 std::bad_weak_ptr 异常

```cpp
void useResource(weak_ptr<Simple>& weakSimple) {
    auto resource = weakSimple.lock();
    if (resource) {
        cout << "Resource still alive." << endl;
    } else {
        cout << "Resource has been freed!" << endl;
    }
}

int main() {
    auto sharedSimple = make_shared<Simple>();
    weak_ptr<Simple> weakSimple(sharedSimple);
    
    // Try to use the weak ptr.
    useResource(weakSimple);
    
    // Reset the shared ptr.
    sharedSimple.reset();
    
    // Try to use the weak ptr a second time.
    useResource(weakSimple);
    
    return 0;
}
```

输出：
```
Simple constructor called!
Resource still alive.
Simple destructor called!
Resource has been freed!
```

## 右值引用与移动语义

### 左值和右值

**左值（lvalue）是可获取其地址的一个量**，例如一个有名称的变量。由于经常出现在赋值语句的左边，因此将其称作左值。

**所有不是左值的量都是右值（rvalue）**，例如**字面量、临时对象或临时值**。通常右值位于赋值运算符的右边。

```cpp
int a = 4 * 2;
```

在这条语句中，a 是左值，它具有名称，它的地址为 &a。右侧表达式 4*2 的结果是右值。它是一个临时值，将在语句执行完毕时销毁。

### 右值引用

右值引用是一个对右值（rvalue）的引用。特别地，这是一个当右值是临时对象时才适用的概念。右值引用允许开发者捕获将要销毁的临时对象，并对其资源进行重新利用。

函数可将 && 作为参数说明的一部分（例如 type&& name），以指定右值引用参数。

```cpp
std::string str1 = "Hello";
std::string str2 = std::move(str1); // str1 的内容被移动到 str2，而不是复制
```

### 移动构造函数示例

假设有一个类 `LargeData`，它包含大量的数据：

```cpp
class LargeData {
public:
    LargeData() {
        data = new int[1000000]; // 大量数据
    }
    ~LargeData() {
        delete[] data;
    }
    LargeData(const LargeData& other) { // 拷贝构造函数
        data = new int[1000000];
        std::copy(other.data, other.data + 1000000, data);
    }
    LargeData(LargeData&& other) noexcept { // 移动构造函数
        data = other.data;
        other.data = nullptr; // 将源对象的指针置空
    }

private:
    int* data;
};
```

移动构造函数通过简单地复制指针 `data`，而不是复制整个数据数组，实现了高效的资源转移。

```cpp
LargeData createLargeData() {
    return LargeData();
}

int main() {
    LargeData ld = createLargeData(); // 移动构造，不是拷贝
    return 0;
}
```

### std::move 的使用

std::move 可将左值转换为右值，强迫编译器调用移动版本的函数：

```cpp
handleMessage(std::move(b)); // Calls handleMessage(string&& value)
```

**重要**：因为有名称的变量是左值。因此，在函数中，右值引用参数本身是一个左值，原因是它具有名称！如果希望将这个左值引用参数作为右值传递给另一个函数，则需要使用 std::move 将左值转换为右值。

```cpp
void helper(std::string&& message);

void handleMessage(std::string&& message) {
    helper(std::move(message)); // 必须使用 std::move
}
```

### 常见错误

```cpp
MyClass a("Hello");
MyClass&& r = std::move(a); // 右值引用赋给右值引用变量 r，但 r 作为变量名，是一个左值。
MyClass b(r); // 错误：调用的是复制构造函数，而不是移动构造函数
```

虽然 `r` 是一个右值引用，但是 `r` 作为一个具名变量是一个左值，因此 `MyClass b(r);` 调用了复制构造函数，而不是移动构造函数。

## 总结

- **unique_ptr**：独占所有权，不可复制，只能移动，适合单一所有者场景
- **shared_ptr**：共享所有权，引用计数，适合多个所有者共享资源
- **weak_ptr**：不拥有资源，用于打破循环引用，检查资源是否存活
- **std::move**：将左值转换为右值引用，触发移动语义
- 优先使用 make_unique 和 make_shared 创建智能指针
- 避免从原始指针创建多个 shared_ptr
