---
title: "catch2测试框架"
date: 2024-01-14T12:42:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["catch2"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "简要介绍怎么用catch编写单元测试"
canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableShare: true
disableHLJS: false
hideSummary: false
searchHidden: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
cover:
    image: "<image path/url>" # image path/url
    alt: "<alt text>" # alt text
    caption: "<text>" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/Dueplay/blog/content"
    Text: "Suggest Changes" # edit text
    appendFilePath: true # to append file path to Edit link
---
## catch2用法

### 定义测试案例

测试案例在 Catch2 中通过 `TEST_CASE` 宏定义。`TEST_CASE` 宏接受两个参数：测试案例的名称和一个可选的标签。

```cpp
#define CATCH_CONFIG_MAIN // 这行让 Catch 自己提供一个 main() 函数
#include <catch2/catch.hpp>

TEST_CASE("A test case", "[tag]") {
    REQUIRE(1 == 1);
}
```

如果你有多个测试文件，只需要在一个文件中定义 `CATCH_CONFIG_MAIN`。

### 断言

Catch2 提供了多种断言宏，最常用的是 `REQUIRE` 和 `CHECK`：

- `REQUIRE`：如果断言失败，当前的测试案例会立即停止。
- `CHECK`：即使断言失败，当前的测试案例也会继续运行，允许多个断言失败。

```cpp
TEST_CASE("Testing addition") {
    REQUIRE(1 + 1 == 2);
    CHECK(2 + 2 == 4);
}
```

### 测试固件

测试固件允许你在每个测试案例之前和之后运行一些代码。测试固件允许你设置和清理测试环境，这对于需要在多个测试案例中重用相同的初始化和清理逻辑非常有用。测试固件通过定义一个结构体或类来实现，你可以在其中定义构造函数（用于设置）和析构函数（用于清理）。然后，使用 `TEST_CASE_METHOD` 宏来指定哪个固件类应该被用于哪个测试案例。

```cpp
struct DatabaseFixture {
    Database db;

    DatabaseFixture() : db("my_database") {
        // 初始化代码，比如打开数据库连接
        db.connect();
    }

    ~DatabaseFixture() {
        // 清理代码，比如关闭数据库连接
        db.disconnect();
    }
};
// 一旦定义了测试固件，就可以在 TEST_CASE_METHOD 宏中使用它
TEST_CASE_METHOD(DatabaseFixture, "Test database connection", "[database]") {
    REQUIRE(db.isConnected() == true);
}

TEST_CASE_METHOD(DatabaseFixture, "Test database query", "[database]") {
    REQUIRE(db.query("SELECT * FROM users").size() > 0);
}
```

在上述代码中，每个 `TEST_CASE_METHOD` 调用都会创建 `DatabaseFixture` 的一个新实例，这意味着每个测试案例都会开始于一个已连接的数据库状态。测试完成后，析构函数会被调用以断开连接，保证了每个测试都是独立的。

### 分节

Catch2 允许你在单个测试案例中定义分节（Section），这些分节可以共享设置代码，但是每个分节会独立运行。

这意味着在进入每个 `SECTION` 前，`TEST_CASE` 中定义的代码会被执行，为每个 `SECTION` 提供了一个共同的起点或环境。

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>

TEST_CASE("Testing with shared setup code", "[example]") {
    // 这里是共享的设置代码
    int value = 42;

    SECTION("Test part 1") {
        // 第一个测试部分可以使用共享的设置代码
        REQUIRE(value == 42);
    }

    SECTION("Test part 2") {
        // 第二个测试部分也可以使用相同的设置代码
        value += 58;
        REQUIRE(value == 100);
    }
}
```

变量 `value` 的初始化就是所谓的“设置代码”，它在两个不同的测试节中被共享。每个 `SECTION` 都独立执行，这意味着每个 `SECTION` 都会从 `TEST_CASE` 的开始处执行，包括共享的设置代码。因此，即便是在不同的测试节中，`value` 也总是从初始值 `42` 开始。

### 参数化测试

Catch2 支持参数化测试，使得你可以用不同的输入重复运行同一测试案例。`GENERATE` 宏能够为测试案例生成一系列的值。在每次测试迭代中，`GENERATE` 会提供一个值，然后测试案例会使用这个值执行。这意味着相同的测试逻辑会被重复执行，但每次都使用不同的输入值。

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>

TEST_CASE("Parameterized tests with GENERATE", "[example]") {
    // 使用 GENERATE 宏生成一系列测试数据
    int input = GENERATE(1, 2, 3, 4, 5);

    // 使用生成的数据执行测试逻辑
    REQUIRE(input < 6);
}
```

在这个例子中，`GENERATE(1, 2, 3, 4, 5)` 会依次为变量 `input` 生成 1 到 5 的值。对于每个生成的值，`REQUIRE(input < 6)` 断言都会被执行一次。因此，这个测试案例会被执行五次，每次使用不同的 `input` 值。

## 集成catch2到cmake

v2.xx的版本只需要catch2.hpp这个头文件就行了

v3.xx的版本的用法：链接到Catch2::Catch2WithMain

```cmake
cmake_minimum_required(VERSION 3.14) # 确保使用的是 FetchContent 可用的 CMake 版本

project(MyProject VERSION 1.0)

include_directories(${PROJECT_SOURCE_DIR}/include)
# 包含 FetchContent 模块
include(FetchContent)

# 使用 FetchContent_Declare 声明 Catch2 作为外部依赖项
FetchContent_Declare(
        Catch2
        GIT_REPOSITORY https://github.com/catchorg/Catch2.git
        GIT_TAG        v3.3.0 # or a later release
)
# 使 Catch2 可用
FetchContent_MakeAvailable(Catch2)

# 添加你的项目文件（示例）
add_executable(my_project src/main.cpp src/sub.cpp)

# 如果你有测试代码，可以像这样设置
enable_testing() # 启用测试

# 添加测试可执行文件
add_executable(
  my_test
  test/test1.cpp
  test/test2.cpp
  # 添加其他测试文件
)

# 链接 Catch2 到测试可执行文件
target_link_libraries(my_test PRIVATE Catch2::Catch2WithMain)

# 为 Catch2 配置测试发现
LIST(APPEND CMAKE_MODULE_PATH ${catch2_SOURCE_DIR}/extras)
include(CTest)
include(Catch)
CATCH_DISCOVER_TESTS(my_test)
```

