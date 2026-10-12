---
title: CMake 构建工具详解
date: 2023-11-20
description: 详细介绍 CMake 的使用方法，包括基本命令、变量操作、库文件管理和项目构建配置。
categories: [DevOps]
---

CMake 是一个跨平台的自动化构建工具，用于管理 C/C++ 项目的编译过程。

## 基本项目结构

```shell
$ tree
.
├── add.c
├── div.c
├── head.h
├── main.c
├── mult.c
└── sub.c
```

## CMakeLists.txt 基础

### 最简单的 CMakeLists.txt

```cmake
# 指定使用的 cmake 的最低版本，可选，非必须，如果不加可能会有警告
cmake_minimum_required(VERSION 3.0)

# 定义工程名称，并可指定工程的版本、工程描述、web主页地址、支持的语言
project(CALC)

# 定义工程会生成一个可执行程序
# 语法：add_executable(可执行程序名 源文件名称)
add_executable(app add.c div.c main.c mult.c sub.c)
```

### 使用变量存储源文件

```cmake
# 定义变量，语法: set(VAR VALUE [CACHE TYPE DOCSTRING [FORCE]])
# [] 里是可选的

# 方式1: 各个源文件之间使用空格间隔
# set(SRC_LIST add.c  div.c   main.c  mult.c  sub.c)

# 方式2: 各个源文件之间使用分号 ; 间隔
set(SRC_LIST add.c;div.c;main.c;mult.c;sub.c)
add_executable(app ${SRC_LIST})
```

## 指定 C++ 标准

### 方式1：在 CMakeLists.txt 中设置

```cmake
# 增加 -std=c++11
set(CMAKE_CXX_STANDARD 11)

# 增加 -std=c++14
set(CMAKE_CXX_STANDARD 14)

# 增加 -std=c++17
set(CMAKE_CXX_STANDARD 17)
```

### 方式2：在命令行指定

```bash
# 增加 -std=c++11
cmake CMakeLists.txt文件路径 -DCMAKE_CXX_STANDARD=11

# 增加 -std=c++14
cmake CMakeLists.txt文件路径 -DCMAKE_CXX_STANDARD=14

# 增加 -std=c++17
cmake CMakeLists.txt文件路径 -DCMAKE_CXX_STANDARD=17
```

## 指定输出路径

在 CMake 中指定可执行程序输出的路径，对应宏 `EXECUTABLE_OUTPUT_PATH`：

```cmake
set(HOME /home/gxj/Linux/Sort)
set(EXECUTABLE_OUTPUT_PATH ${HOME}/bin)
```

- 第一行：定义一个变量用于存储一个绝对路径
- 第二行：将拼接好的路径值设置给 `EXECUTABLE_OUTPUT_PATH` 宏
- 如果这个路径中的子目录不存在，会自动生成，无需自己手动创建
- 使用相对路径时，`./` 表示生成的 makefile 所在目录

## 搜索文件

### 使用 aux_source_directory

可以查找某个路径下的所有源文件：

```cmake
aux_source_directory(<dir> <variable>)
```

- `dir`：要搜索的目录
- `variable`：将从 dir 目录下搜索到的源文件列表存储到该变量中

```cmake
# 搜索 src 目录下的源文件
aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/src SRC_LIST)
add_executable(app ${SRC_LIST})
```

### 使用 file 命令

```cmake
file(GLOB/GLOB_RECURSE 变量名 要搜索的文件路径和文件类型)
```

- `GLOB`：将指定目录下搜索到的满足条件的所有文件名生成一个列表，并将其存储到变量中
- `GLOB_RECURSE`：递归搜索指定目录

```cmake
# 搜索当前目录的 src 目录下所有的源文件，并存储到变量中
file(GLOB MAIN_SRC ${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp)
file(GLOB MAIN_HEAD ${CMAKE_CURRENT_SOURCE_DIR}/include/*.h)
```

`CMAKE_CURRENT_SOURCE_DIR` 宏表示当前访问的 CMakeLists.txt 文件所在的路径。

要搜索的文件路径和类型可加双引号，也可不加：

```cmake
file(GLOB MAIN_HEAD "${CMAKE_CURRENT_SOURCE_DIR}/src/*.h")
```

## 包含头文件

在编译项目源文件的时候，需要将源文件对应的头文件路径指定出来：

```cmake
include_directories(headpath)
```

```cmake
# 指定头文件的路径为项目根目录下面的 include
include_directories(${PROJECT_SOURCE_DIR}/include)
```

`PROJECT_SOURCE_DIR` 宏对应的值就是我们在使用 cmake 命令时，后面紧跟的目录，一般是工程的根目录。

### 查找必要的库

```cmake
find_package(xxx REQUIRED)  # 根据 cmake/module/Findxxx.cmake 找
# 找不到可能需要添加 Findxxx.cmake
```

## 制作静态库和动态库

### 制作静态库

```cmake
add_library(库名称 STATIC 源文件1 [源文件2] ...)
```

静态库名字分为三部分：`lib` + 库名字 + `.a`，此处只需要指定出库的名字就可以了。

```cmake
include_directories(${PROJECT_SOURCE_DIR}/include)
file(GLOB SRC_LIST "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
add_library(calc STATIC ${SRC_LIST})
```

### 制作动态库

```cmake
add_library(库名称 SHARED 源文件1 [源文件2] ...)
```

动态库名字分为三部分：`lib` + 库名字 + `.so`。

```cmake
add_library(calc SHARED ${SRC_LIST})
```

### 指定库输出路径

**方式1 - 适用于动态库**：

对于生成的库文件来说和可执行程序一样都可以指定输出路径。由于在 Linux 下生成的动态库默认是有执行权限的，所以可以按照生成可执行程序的方式去指定它生成的目录：

```cmake
# 设置动态库生成路径
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)
add_library(calc SHARED ${SRC_LIST})
```

**方式2 - 都适用**：

由于在 Linux 下生成的静态库默认不具有可执行权限，所以在指定静态库生成的路径的时候就不能使用 `EXECUTABLE_OUTPUT_PATH` 宏了，而应该使用 `LIBRARY_OUTPUT_PATH`，这个宏对应静态库文件和动态库文件都适用。

```cmake
# 设置动态库/静态库生成路径
set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)

# 生成动态库
#add_library(calc SHARED ${SRC_LIST})

# 生成静态库
add_library(calc STATIC ${SRC_LIST})
```

## 链接库文件

### 链接静态库

```cmake
link_libraries(<static lib> [<static lib>...])
```

- 参数1：指定出要链接的静态库的名字，可以是全名 `libxxx.a`，也可以是掐头（lib）去尾（.a）之后的名字 `xxx`
- 参数2-N：要链接的其它静态库的名字

如果该静态库不是系统提供的（自己制作或者使用第三方提供的静态库），可能出现静态库找不到的情况，此时可以将静态库的路径也指定出来：

```cmake
link_directories(<lib path>)
```

```cmake
# 包含静态库路径
link_directories(${PROJECT_SOURCE_DIR}/lib)

# 链接静态库
link_libraries(calc)
```

### 链接动态库

使用 `target_link_libraries` 命令就可以链接动态库，也可以链接静态库文件。

```cmake
target_link_libraries(
    <target> 
    <PRIVATE|PUBLIC|INTERFACE> <item>... 
    [<PRIVATE|PUBLIC|INTERFACE> <item>...]...)
```

- `target`：指定要加载动态库的文件的名字，该文件可能是一个源文件、动态库文件或可执行文件
- `PRIVATE|PUBLIC|INTERFACE`：动态库的访问权限，默认为 PUBLIC

如果各个动态库之间没有依赖关系，无需做任何设置，三者没有区别，一般无需指定，使用默认的 PUBLIC 即可。

- **PUBLIC**：在 public 后面的库会被 Link 到前面的 target 中，并且里面的符号也会被导出，提供给第三方使用
- **PRIVATE**：在 private 后面的库仅被 link 到前面的 target 中，并且终结掉，第三方不能感知你调了啥库
- **INTERFACE**：在 interface 后面引入的库不会被链接到前面的 target 中，只会导出符号

**动态库的链接和静态库是完全不同的**：

- 静态库会在生成可执行程序的链接阶段被打包到可执行程序中，所以可执行程序启动，静态库就被加载到内存中了
- 动态库在生成可执行程序的链接阶段不会被打包到可执行程序中，当可执行程序被启动并且调用了动态库中的函数的时候，动态库才会被加载到内存

因此，在 cmake 中指定要链接的动态库的时候，应该将命令写到生成了可执行文件之后：

```cmake
# 添加并指定最终生成的可执行程序名
add_executable(app ${SRC_LIST})

# 指定可执行程序要链接的动态库名字
target_link_libraries(app pthread)
```

- `app`：对应的是最终生成的可执行程序的名字
- `pthread`：这是可执行程序要加载的动态库，这个库是系统提供的线程库，全名为 `libpthread.so`，在指定的时候一般会掐头（lib）去尾（.so）

### 链接第三方动态库

假设在测试文件 main.cpp 中既使用了自己制作的动态库 libcalc.so 又使用了系统提供的线程库，此时 CMakeLists.txt 文件可以这样写：

```cmake
cmake_minimum_required(VERSION 3.0)
project(TEST)
file(GLOB SRC_LIST ${CMAKE_CURRENT_SOURCE_DIR}/*.cpp)

# 指定源文件或者动态库对应的头文件路径
include_directories(${PROJECT_SOURCE_DIR}/include)

# 指定要链接的动态库的路径
link_directories(${PROJECT_SOURCE_DIR}/lib)

# 添加并生成一个可执行程序
add_executable(app ${SRC_LIST})

# 指定要链接的动态库
target_link_libraries(app pthread calc)
```

## 日志输出

在 CMake 中可以用 message 显示一条消息：

```cmake
message([STATUS|WARNING|AUTHOR_WARNING|FATAL_ERROR|SEND_ERROR] "message to display" ...)
```

- **(无)**：重要消息
- **STATUS**：非重要消息
- **WARNING**：CMake 警告, 会继续执行
- **AUTHOR_WARNING**：CMake 警告 (dev), 会继续执行
- **SEND_ERROR**：CMake 错误, 继续执行，但是会跳过生成的步骤
- **FATAL_ERROR**：CMake 错误, 终止所有处理过程

```cmake
# 输出一般日志信息
message(STATUS "source path: ${PROJECT_SOURCE_DIR}")

# 输出警告信息
message(WARNING "source path: ${PROJECT_SOURCE_DIR}")

# 输出错误信息
message(FATAL_ERROR "source path: ${PROJECT_SOURCE_DIR}")
```

## 变量操作

### 追加 - 使用 set 拼接

如果使用 set 进行字符串拼接，对应的命令格式如下：

```cmake
set(变量名1 ${变量名1} ${变量名2} ...)
```

将从第二个参数开始往后所有的字符串进行拼接，最后将结果存储到第一个参数中，如果第一个参数中原来有数据会对原数据进行覆盖。

```cmake
set(TEMP "hello,world")
file(GLOB SRC_1 ${PROJECT_SOURCE_DIR}/src1/*.cpp)
file(GLOB SRC_2 ${PROJECT_SOURCE_DIR}/src2/*.cpp)
# 追加
set(SRC_1 ${SRC_1} ${SRC_2} ${TEMP})
```

## 常用宏和变量

### CMAKE_CURRENT_SOURCE_DIR
当前访问的 CMakeLists.txt 文件所在的路径

### PROJECT_SOURCE_DIR
工程的根目录，一般是使用 cmake 命令时后面紧跟的目录

### CMAKE_CXX_STANDARD
指定 C++ 标准

### EXECUTABLE_OUTPUT_PATH
可执行程序输出路径

### LIBRARY_OUTPUT_PATH
库文件输出路径

## CMake 构建流程

### 1. 编写 CMakeLists.txt

在项目根目录创建 CMakeLists.txt 文件。

### 2. 生成 Makefile

```bash
# 在项目根目录执行
cmake .

# 或者在 build 目录中执行
mkdir build
cd build
cmake ..
```

### 3. 编译项目

```bash
make

# 或者使用 cmake 命令编译
cmake --build .
```

### 4. 运行程序

```bash
./app
```

## 最佳实践

### 项目结构

```
project/
├── CMakeLists.txt       # 主构建文件
├── include/             # 头文件目录
│   └── *.h
├── src/                 # 源文件目录
│   └── *.cpp
├── lib/                 # 库文件目录（生成）
├── bin/                 # 可执行文件目录（生成）
└── build/               # 构建目录（推荐使用）
```

### 推荐的 CMakeLists.txt 模板

```cmake
cmake_minimum_required(VERSION 3.10)
project(MyProject VERSION 1.0)

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 设置输出目录
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)
set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)

# 包含头文件目录
include_directories(${PROJECT_SOURCE_DIR}/include)

# 搜索源文件
file(GLOB_RECURSE SRC_LIST ${PROJECT_SOURCE_DIR}/src/*.cpp)

# 生成可执行文件
add_executable(${PROJECT_NAME} ${SRC_LIST})

# 链接库（如果需要）
# target_link_libraries(${PROJECT_NAME} pthread)
```

## 总结

CMake 是一个强大的跨平台构建工具：

- 使用简单的语法描述构建过程
- 自动处理依赖关系
- 支持多种编译器和平台
- 方便管理复杂的项目结构

掌握 CMake 是现代 C/C++ 开发的必备技能。
