---
title: 'C++ 生成随机数的方法'
pubDate: 2024-12-03
categories: ['C++']
description: '介绍在 C++ 中生成随机数的几种方法，从基础的 rand() 到现代的 <random> 库'
---

在 C++ 中，生成随机数可以使用几种不同的方法，这取决于你需要的随机数的类型（整数、浮点数等）以及随机数的质量（是否需要非确定性的随机数）。以下是一些常用方法：

## 使用 `<cstdlib>` 中的 `rand()`

这是最基本的随机数生成方法，适用于简单场景：

```cpp
#include <cstdlib> // 包含 rand() 和 srand()
#include <ctime>   // 包含 time()

int main() {
    // 使用当前时间作为随机种子
    srand(static_cast<unsigned int>(time(0)));

    // 生成一个 [0, RAND_MAX] 范围内的随机数
    int randomNumber = rand();

    return 0;
}
```

这种方法的局限性在于它产生的是伪随机数，并且如果不设置不同的随机种子，每次程序运行时生成的随机数序列都是相同的。

## 使用 C++11 `<random>` 库（推荐）

C++11 引入了更灵活且功能更强大的随机数生成库 `<random>`，它支持多种随机数分布和更好的随机性：

```cpp
#include <iostream>
#include <random>

int main() {
    // 随机数生成器
    std::mt19937 generator(static_cast<unsigned long>(std::random_device{}()));
    // std::random_device 是一个用来生成高质量随机数的类
    // 它通常用于为随机数生成器（如 std::mt19937）提供非确定性随机种子

    // 定义一个范围在 [10, 99] 的均匀分布
    std::uniform_int_distribution<int> distribution(10, 99);

    // 生成随机数
    int randomNumber = distribution(generator);

    std::cout << "Random Number: " << randomNumber << std::endl;

    return 0;
}
```

### `std::random_device{}()` 解释

- `std::random_device{}` 是创建一个 `std::random_device` 对象的临时表达式。在这里，使用了花括号来调用 `std::random_device` 的默认构造函数，但它等同于使用圆括号 `std::random_device()`。

- 紧跟在后面的第二个 `()` 表示对这个临时 `std::random_device` 对象调用 `operator()` 方法，该方法生成并返回一个随机数。

```cpp
// 创建 std::random_device 对象并生成一个随机数
auto random_number = std::random_device{}();
```

这种方法通过不同的随机数引擎（如 `std::mt19937`）和分布（如 `std::uniform_int_distribution`）允许更精确地控制随机数的生成，包括生成范围和类型。

## 生成非确定性随机数

如果需要非确定性的随机数（例如，对安全性有较高要求的场合），可以直接使用 `std::random_device`：

```cpp
#include <iostream>
#include <random>

int main() {
    std::random_device rd;
    std::cout << "Random Number: " << rd() << std::endl;

    return 0;
}
```

`std::random_device` 尝试提供真正的随机数，但请注意，其性能和质量可能因平台而异。

## 总结

选择哪种方法取决于你的具体需求，如随机数的用途、需要的随机性质量以及是否需要控制随机数的分布特性。对于大多数应用，C++11 的 `<random>` 库提供的功能已经足够且推荐使用。
