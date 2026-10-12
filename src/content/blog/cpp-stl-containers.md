---
title: "C++ STL容器详解"
pubDate: 2024-12-03
categories: ["C++", "STL", "编程基础"]
description: "深入讲解C++ STL容器的使用，包括vector、deque、priority_queue等容器的特性、内存管理和最佳实践"
---

## 1.vector

### 构造函数和析构函数

默认的构造函数创建一个不包含元素的 vector。
vector<int> intVector; 
可指定元素个数，还可指定这些元素的值，如下所示:
vector<int> intVector(10，100); 
如果没有提供默认值，那么对新对象进行 0初始化。**0 初始化通过默认构造函数构建对象**，将基本的整数类型(例如 char 和nt 等)初始化为0，将基本的浮点类型初始化为0.0，将指针类型初始化为 nullptr。
还可创建内建类的vector，如下所示:
vector<string> strinqVector(10，"hello"):
用户自定义的类Element也可以用作vector 元素:
vector<Element> elementVector;
可以使用包含初始元素的initializer list构建vector:
vector<int>intVector( {1，2，3，4，5，6 });
统一初始化可用于大部分标准库容器。例如:
vector<int>intVector1= {1，2，3，4，5，6 };
vector<int>intVector2 { 1，2，3，4，5，6 };

### vector的复制和赋值

vector 存储对象的副本，其析构函数调用每个对象的析构函数。vector 类的复制构造函数和赋值运算符对vector 中的所有元素执行深拷贝。
除普通的复制和赋值外，vetor 还提供了 assign0)方法，这个方法删除所有现有的元素，并添加任意数目的新元素。这个方法特别适合于 vector 的重用。下面是一个简单的例子。intVector 包含 10个默认值为0的元素然后通过assign0删除所有 10个元素，并以5个值为100的元素代之

vector<int> intVector(10);
// Other code .
intVector.assign(5，100);
如下所示，assign()还可接收 initializer list。intVector 现在有4个具有给定值的元素
intVector.assiqn([ 1，2，3，4});
vector 还提供了 swap()方法，这个方法可交换两个 vector 的内容，并且具有常量时间复杂度。下面举一个简单示例:
vector<int> vectorOne(10):
vector<int> vectorTwo(5，100);
vectorOne.swap(vectorTwo);

### vector 的比较

标准库在 vector 中提供了6个重载的比较运算符:== 、!=,< , >, <=和 >=。如果两个 vetor 的元素数量相等，而且对应元素都相等，那么这两个 vector 相等。两个 vector 的比较采用字典顺序:如果第一个 vector 中从0到i-1的所有元素都等于第二个vetor中从0到i-1的所有元素,第一个vetor中的元素i小于第二个vector中的元素i，0 <= i < size()，那么第一个 vector"小于"第二个 vector; 其中的 size()是指两个 vector 中较小者的大小。
注意:
通过 operator==和 operator!=比较两个 vector 时，要求每个元素都能通过 operator==运算符进行比较。通过operator<、operator>,operator<=或operator>=比较两个 vector 时，要求每个元素都能通过operator<运算符进行比较。如果要在 vector 中保存自定义类的对象，务必编写这些运算符。

### 迭代器

每个容器都定义了一种名为 iterator 的类型，以表示这种容器类型的迭代器。begin()返回引用容器中第一个元素的相应类型的迭代器。

```c++
for (vector<double>::iterator iter = begin(doubleVector); iter != end(doubleVector); ++iter) {
    *iter += 10;
}
// 使用auto简化
for (auto iter = begin(doubleVector); iter != end(doubleVector); ++iter) {
    *iter += 10;
}
```

通过*解除引用 iter，从而获得 iter 引用的
元素。访问对象元素中的字段，如果容器中的元素是对象，那么可对迭代器使用->运算符，调用对象的方法或访问对象的成员

const iterator
普通的选代器支持读和写。然而，如果对 const 对象调用 begin()和 end()，或调用cbegin()和 cend()，将得到 const iterator。const iterator 是只读的，不能通过 const iterator 修改元素。iterator 始终可以转换为 const iterator.
因此下面这种写法是安全的:
vector<type>::const iterator it = begin(myVector);
然而，const iterator 不能转换为iterator。如果 myVector 是 const 的，那么下面这行代码无法编译
vector<type>::iterator it = begin(myVector);

在使用auto关键字时，const iterator 的使用看上去有一点区别。假设有以下代码:
vector<string> stringVector(10，"hello");
for (auto iter = begin(stringVector); iter != end(stringVector); ++iter) (
cout << *iter << endl;
由于使用了auto关键字,编译器会自动判定iter变量的类型,然后将其设置为普通的iterator,因为stringVector不是 const。如果需要结合 auto 使用只读的 const iterator, 那么需要使用 cbegin()和 cend()，而不是 begin()
和end()，如下所示:
vector<string> stringVector(10，"hello"):
for (auto iter = cbegin(stringVector); iter != cend(stringVector); ++iter){
cout << *iter << endl;

基于区间的for循环也可用于强制使用const iterator，如下所示:
vector<string> stringVector(10，"hello");
for (const auto& element : stringVector) 

vector 迭代器是随机访问的，因此可以向前或向后移动，还可以随意跳跃。

可以实现 +=，-=， --， ++操作

**注意**：

尽量使用前递增而不要使用后递增，因为前递增至少效率不会差，一般更高效。iter++必须返回一个新的迭代器对象(++之前的迭代器)，而++iter 只是返回对iter的引用。

标准库还支持全局非成员函数std::begin()、end()、cegin()、cend()、rbegin()、rend()、crbegin()和 crend()。
建议使用这些**非成员函数**而不是其成员版本。

如果不需要修改 vector 中的元素，那么应该使用 const iterator。遵循这条原则，将更容易保证代码的正确还允许编译器执行特定的优化。

#### 迭代器还是索引?

既然可以编写 for 循环，使用简单索引变量和 size()方法遍历 vetor 中的元素，为什么还要使用迭代器? 主要有 3 个原因:
使用迭代器可在容器的任意位置插入、删除元素或元素序列。
使用迭代器可使用标准库算法
通过迭代器顺序访问元素，通常比编制容器索引以单独检索每个元素的效率要高。这种特性不适用于vector，但适用于list、map 和set。

### 在vector中存储引用

可在诸如vector 的容器中存储引用。为此，在容器中存储 std::reference wrapper。std::ref0
和cref)函数模板用于创建非 const 和 constreference wrapper 实例。需要包含<functional>头文件。示例如下:

```c++
string str1 ="Hello";
string str2 ="World";
vector<reference_wrapper<string>> vec{ref(str1) };
vec.push_back(ref(str2)); 
vec[1].get() +="!";
cout << str1 <<" "<< str2 <<endl;
```

### 添加和删除元素

通过 push_back()方法可向 vector 追加元素。vector 还提供了删除元素的对应方法:
pop_back()。pop_back()不会返回已删除的元素。
通过insert()方法可在 vector 中的任意位置插入元素，这个方法在迭代器指定的位置添加一个或多个元素将所有后续元素向后移动，给新元素腾出空间。insert()有 5种不同的重载形式:
1.insert(const_iterator pos,const T&x):将值x插入位置pos。
2.insert(const_iterator pos,size_type n,constT& x):将值在位置 pos 插入n次。
3.insert(const_iterator pos,Inputlterator first,InputIterator last): 将范围[frst, last)内的元素插入位置 pos。迭代器范围是半开区间，因此包含起始迭代器所指的元素，但不包含末尾迭代器所指的元素。
4.使用移动语义，将给定元素转移到 vector 中，插入一个元素。
5.向 vector 中插入一列元素，这列元素是通过initializer list 指定的
注意:
push_back()和 insert()还有把左值或右值作为参数的版本。两个版本都根据需要分配内存，以存储新元素.左值版本保存新元素的副本。右值版本使用移动语义，将给定元素的所有权转移到 vector，而不是复制它们。

通过erase()可在 vector 中的任意位置删除元素，通过 clear()可删除所有元素。erase()有两种形式:一种接收单个迭代器，删除单个元素;另一种接收两个迭代器，删除迭代器指定的元素范围。

### 移动语义

所有的标准库容器都包含移动构造函数和移动赋值运算符，从而实现了移动语义这带来的
大好处是可以通过传值的方式从函数返回标准库容器，而不会降低性能。

与此类似，push 操作在某些情况下也会通过移动语义提升性能。例如
vector<string> vec;
向这个 vector 添加元素
string myElement(5，'a'); // Constructs the string "aaaaa"
vec.push_back(myElement);
然而，由于myElement不是临时对象，因此 push_back()会生成myElement 的副本，并存入 vector。
vector 类还定义了push back(T&& val)，这是 push back(const T& va)的移动版本。如果按照下列方式调用push_back()方法，则可以避免这种复制:
vec.push back(move(myElement));
现在可以明确地说，myElement应移入 vector。注意在执行这个调用后，myElement 处于有效但不确定的状态，不应再使用myElement，除非通过调用 clear()等使其重返确定状态。也可以这样
vec.push back(string(5，a'));
该调用会触发移动版本的调用，因为调用 string 构造函数后生成的是一个临时 string对
象。push_back()方法将这个临时 string对象移到 vector 中，从而避免了复制。

### emplace 操作

C++在大部分标准库容器(包括 vector)中添加了对 emplace 操作的支持。emplace 的意思是"放置到位"
emplace 操作的一个示例是 vector 对象上的emplace_back()，这个方法**不会复制或移动任何数据，而是在容器中分配空间，然后就地构建对象**。例如:
vec.emplace_back(5，a');
emplace 操作以可变参数模板的形式接收可变数目的参数。
emplace_back()和使用移动语义的 push_back()之间的性能差异取决于特定编译器实现这些操作的方式。大部分情况下，可根据自己喜好的语法来选择。
vec.push_back(string(5，a')); // move
//or emplace
vec.emplace_back(5，a');
从C++17开始，emplace_back()方法返回已插入元素的引用。在C++17之前，emplace_back()的返回类型是void。
还有一个emplace()方法，可在 vector 的指定位置就地构建对象，并返回所插入元素的迭代器

### vector内存分配方案

vector 会自动分配内存来保存插入的元素。由于不可能请求在当前内存块的尾部添加内存，因此每次 vector 申请更多内存时，都一定要在
另一个位置分配一块新的更大的内存块，然后将所有元素复制/移动到新的内存块。这个过程非常耗时，因此vector 的实现在执行重分配时，会分配比所需内存更多的内存，以尽量避免这个复制转移过程。通过这种方式，
vector可避免在每次插入元素时都重新分配内存。

vector 内部的重分配可能导致引用 vector 中元素的所有选代器失效，而不只是那些引用插入点或删除点之后的元素的迭代器。如果不显式控制重分配，应该假定每次插入都会导致重分配以及所有迭代器失效。

### 大小和容量

size()方法返回 vector 中元素的个数，而
capacity()返回的是 vector 在重分配之前可以保存的元素个数。因此，在重分配之前还能插入的元素个数为capacity() - size()。
注意:
通过empty()方法可以查询vector 是否为空。vector 可以为空，但容量不能为0。
C++17 引入了非成员的 std:size()和 std::empty()全局函数。这些与用于获取迭代器的非成员函数(如 std:begin0和std::end0等)类似。非成员函数 size()和 empty()可用于所有容器，也可用于静态分配的 C 风格数组(不通过指针访问)以及initializer list。下面是一个将它们用于 vector的例子:
vector<int> vec{1,2,3} ;
cout << size(vec) << endl;
cout << empty(vec) << endl;

### 预留容量

如果不关心效率和迭代器失效，那么也不需要显式地控制 vector 的内存分配。然而，如果希望程序尽可能高效，或要确保跌代器不会失效，就可以强迫 vector 预先分配足够的空间，以保存所有元素。当然，需要知道
vector 将保存多少元素，但有时这是无法预测的。
一种预分配空间的方式是调用 reserve()。这个方法负责分配保存指定数目元素的足够空间。
警告:
为元素预留空间改变的是容量而非大小。也就是说，这个过程不会创建真正的元素。不要越过 vector 大小访问元素。
另一种预分配空间的方法是在构造函数中，或者通过resize()或assign()方法指定 vector 要保存的元素数目，这种方法会创建指定大小的 vector(容量也可能就是这么大)。

### 直接访问数据

vector在内存中连续存储数据，可使用data()方法获取指向这块内存的指针。
C++17引入了非成员的std::data()全局函数来获取数据的指针。它可用于 array、vector 容器、字符串、静态分配的C风格数组(不通过指针访问)和initializer lists。下面是一个用于 vector 的示例:
vector<int>vec {1,2,3 }
int* datal = vec.data();
int* data2 = data(vec);

### 注意点：

1.vector在<vector>头文件中被定义为一个带有两个类型参数的类模板:一个参数为要保存的元素类型，另一个参数为分配器(allocator)类型。

```c++
template <class T，class Allocator = allocator<T>> class vector;
```

2.operator[]没有提供边界检查，at()会执行边界检查，如果索引超出边界抛出out_of_range异常。

3.operator[]运算符返回的是对一个元素引用，可将这个引用放在赋值语句的左侧，也是可以对v[index] = x的原因。对const vector对应应用operator[]就会返回一个对const元素的引用，不能作为赋值的目标。此外，front(),back()也是返回的引用，对空容器调用front()和back()会引发未定义行为。

4.使用范围for，需要修改元素需要用auto&，而不是auto。

## 2.deque

deque(double-endedqueue 的简称)几乎和 vector 是等同的，但用得更少。deque 定义在<deque>头文件中。主要区别如下:
1.不要求元素保存在连续内存中。
2.deque 支持首尾两端常量时间的元素插入和删除操作(vector 只支持尾端)。
3.deque 提供了 push_front()、pop_front()和 emplace_front()，而 vector 没有提供。从 C++17 开始,emplace front()返回已插入元素的引用而非void。
4.在开头和末尾插入元素时，deque 未使迭代器失效。
5.deque 没有通过 reserv()和 capacity()公开内存管理方案。

## priority_queue

优先队列(priority queue)是一种按顺序保存元素的队列。优先队列不保证严格的 FIFO 顺序队而是保证在对列头部的元素任何时刻都具有最高优先级。这个元素可能是队列中最老的那个元素，也可能是最新的那个元素
如果两个元素的优先级相等，那么它们在队列中的相对顺序是未确定的。
priority queue容器适配器也定义在<queue>中。其模板定义如下(稍有简化):
template <class T，class Container = vector<T>，class Compare = less<T>>;
这个类没有看上去这么复杂。之前看到了前两个参数:T是 priority queue 中保存的元素类型;Container 是priority_queue适配的底层容器。priority queue 默认使用vector，但是也可以使用deque。这里不能使用 list，因为
priority queue 要求随机访问元素。第3 个参数 Compare 复杂一些。less是一个类模板，支持两个类型为T的元素通过 operator<运算符进行比较。也就是说，要根据 operato<来确定队列中元素的优先级，可以自定义这里使用的比较操作。
注意:
priority_queue的头元素是优先级最高的元素，默认情况下优先级是通过operator<运算符来判断的，T1 < T2 则T1优先级比T2低，比其他元素"小"的元素的优先级比其他元素低。

### priority_queue 提供的操作

priority_queue 提供的操作比 queue 要少。push和 emplace()可以插入元素，pop()可以删除元素，top()可以返回头元素的const 引用。
**警告**:
在非 const对象上调用 top()，top()返回的也是const引用，因为修改元素可能会改变元素的顺序，所以不允许修改。priority_queue 没有提供获得尾元素的机制。
**警告**:
pop()不返回弹出的元素。如果需要获得一份副本，必须首先通过 top()获得这个元素

与queue 一样，priority queue 支持 size()、empty()和 swap()。然而，priority queue 没有提供任何比较运算符
