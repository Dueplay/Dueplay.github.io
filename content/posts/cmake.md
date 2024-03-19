---
title: "cmake Tutorial"
date: 2023-03-25T14:42:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["cmake"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "介绍cmake的使用"
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
 

### 文件目录结构

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

```cmake
# 指定使用的 cmake 的最低版本，可选，非必须，如果不加可能会有警告
cmake_minimum_required(VERSION 3.0)
# 定义工程名称，并可指定工程的版本、工程描述、web主页地址、支持的语言
project(CALC)
# 定义工程会生成一个可执行程序，语法add_executable(可执行程序名 源文件名称)
add_executable(app add.c div.c main.c mult.c sub.c)

# 定义变量，语法: set(VAR VALUE [CACHE TYPE DOCSTRING [FORCE]]).[]里是可选的
# eg.将文件名对应字符串存起来。
# 方式1: 各个源文件之间使用空格间隔
# set(SRC_LIST add.c  div.c   main.c  mult.c  sub.c)

# 方式2: 各个源文件之间使用分号 ; 间隔
set(SRC_LIST add.c;div.c;main.c;mult.c;sub.c)
add_executable(app  ${SRC_LIST})

# 指定c++标准
# 使用g++时: $ g++ *.cpp -std=c++11 -o app
# C++标准对应有一宏叫做DCMAKE_CXX_STANDARD，在CMake中想要指定C++标准有两种方式：
# 在cmakelists.txt中通过 set 命令指定
# 增加-std=c++11
set(CMAKE_CXX_STANDARD 11)
# 增加-std=c++14
set(CMAKE_CXX_STANDARD 14)
# 增加-std=c++17
set(CMAKE_CXX_STANDARD 17)

# 在执行 cmake 命令的时候指定出这个宏的值，-D表示定义宏
#增加-std=c++11
cmake CMakeLists.txt文件路径 -DCMAKE_CXX_STANDARD=11
#增加-std=c++14
cmake CMakeLists.txt文件路径 -DCMAKE_CXX_STANDARD=14
#增加-std=c++17
cmake CMakeLists.txt文件路径 -DCMAKE_CXX_STANDARD=17

# 指定输出的路径，在CMake中指定可执行程序输出的路径，也对应一个宏，叫做EXECUTABLE_OUTPUT_PATH，它的值还是通过set命令进行设置
set(HOME /home/gxj/Linux/Sort)
set(EXECUTABLE_OUTPUT_PATH ${HOME}/bin)
# 第一行：定义一个变量用于存储一个绝对路径
# 第二行：将拼接好的路径值设置给EXECUTABLE_OUTPUT_PATH宏
# 如果这个路径中的子目录不存在，会自动生成，无需自己手动创建
# 使用相对路径时，./表示生成的makefile所在目录

# 搜索文件
# 如果一个项目里边的源文件很多，在编写CMakeLists.txt文件的时候不可能将项目目录的各个文件一一罗列出来，这样太麻烦也不现实。所以，在CMake中为我们提供了搜索文件的命令，可以使用aux_source_directory命令或者file命令。
# 使用aux_source_directory 命令可以查找某个路径下的所有源文件，命令格式为：
aux_source_directory(< dir > < variable >)
dir：要搜索的目录
variable：将从dir目录下搜索到的源文件列表存储到该变量中
# 搜索 src 目录下的源文件
aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/src SRC_LIST)
add_executable(app  ${SRC_LIST})

# 使用file 命令 (当然，除了搜索以外通过 file 还可以做其他事情)
file(GLOB/GLOB_RECURSE 变量名 要搜索的文件路径和文件类型)
GLOB: 将指定目录下搜索到的满足条件的所有文件名生成一个列表，并将其存储到变量中。
GLOB_RECURSE：递归搜索指定目录，将搜索到的满足条件的文件名生成一个列表，并将其存储到变量中。
搜索当前目录的src目录下所有的源文件，并存储到变量中
file(GLOB MAIN_SRC ${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp)
file(GLOB MAIN_HEAD ${CMAKE_CURRENT_SOURCE_DIR}/include/*.h)
CMAKE_CURRENT_SOURCE_DIR 宏表示当前访问的 CMakeLists.txt 文件所在的路径。
要搜索的文件路径和类型可加双引号，也可不加:
file(GLOB MAIN_HEAD "${CMAKE_CURRENT_SOURCE_DIR}/src/*.h")

# 包含头文件
# 在编译项目源文件的时候，很多时候都需要将源文件对应的头文件路径指定出来，这样才能保证在编译过程中编译器能够找到这些头文件，并顺利通过编译。在CMake中设置要包含的目录也很简单，通过include_directories命令
include_directories(headpath)
# 指定就是头文件的路径为项目根目录下面的include
include_directories(${PROJECT_SOURCE_DIR}/include)
PROJECT_SOURCE_DIR宏对应的值就是我们在使用cmake命令时，后面紧跟的目录，一般是工程的根目录。

# 制作动态库或静态库，源代码并不需要将他们编译生成可执行程序，而是生成一些静态库或动态库提供给第三方使用，下面来是在cmake中生成这两类库文件的方法。
# 在cmake中，如果要制作静态库，需要使用的命令如下：静态库名字分为三部分：lib+库名字+.a，此处只需要指定出库的名字就可以了
add_library(库名称 STATIC 源文件1 [源文件2] ...) 
# eg
include_directories(${PROJECT_SOURCE_DIR}/include)
file(GLOB SRC_LIST "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
add_library(calc STATIC ${SRC_LIST})

# 要制作动态库，需要使用的命令如下，动态库名字分为三部分：lib+库名字+.so，此处只需要指定出库的名字就可以了，另外两部分在生成该文件的时候会自动填充。
add_library(库名称 SHARED 源文件1 [源文件2] ...) 
add_library(calc SHARED ${SRC_LIST})

# 指定库输出的路径
# 方式1 - 适用于动态库
对于生成的库文件来说和可执行程序一样都可以指定输出路径。由于在Linux下生成的动态库默认是有执行权限的，所以可以按照生成可执行程序的方式去指定它生成的目录：
# 设置动态库生成路径，其实就是通过set命令给EXECUTABLE_OUTPUT_PATH宏设置了一个路径，这个路径就是可执行文件生成的路径
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)
add_library(calc SHARED ${SRC_LIST})
# 方式2 - 都适用
由于在Linux下生成的静态库默认不具有可执行权限，所以在指定静态库生成的路径的时候就不能使用EXECUTABLE_OUTPUT_PATH宏了，而应该使用LIBRARY_OUTPUT_PATH，这个宏对应静态库文件和动态库文件都适用。
# 设置动态库/静态库生成路径
set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)
# 生成动态库
#add_library(calc SHARED ${SRC_LIST})
# 生成静态库
add_library(calc STATIC ${SRC_LIST})

# 包含库文件
# 链接静态库的命令如下：参数1：指定出要链接的静态库的名字，可以是全名 libxxx.a，也可以是掐头（lib）去尾（.a）之后的名字 xxx。参数2-N：要链接的其它静态库的名字
link_libraries(<static lib> [<static lib>...])
如果该静态库不是系统提供的（自己制作或者使用第三方提供的静态库）可能出现静态库找不到的情况，此时可以将静态库的路径也指定出来：
link_directories(<lib path>)
# 包含静态库路径
link_directories(${PROJECT_SOURCE_DIR}/lib)
# 链接静态库
link_libraries(calc)

# 链接动态库，使用 target_link_libraries 命令就可以链接动态库，也可以链接静态库文件。
target_link_libraries(
    <target> 
    <PRIVATE|PUBLIC|INTERFACE> <item>... 
    [<PRIVATE|PUBLIC|INTERFACE> <item>...]...)
target：指定要加载动态库的文件的名字该文件可能是一个源文件,or动态库文件or可执行文件
PRIVATE|PUBLIC|INTERFACE：动态库的访问权限，默认为PUBLIC
如果各个动态库之间没有依赖关系，无需做任何设置，三者没有没有区别，一般无需指定，使用默认的 PUBLIC 即可。
PUBLIC：在public后面的库会被Link到前面的target中，并且里面的符号也会被导出，提供给第三方使用。
PRIVATE：在private后面的库仅被link到前面的target中，并且终结掉，第三方不能感知你调了啥库
INTERFACE：在interface后面引入的库不会被链接到前面的target中，只会导出符号。

动态库的链接和静态库是完全不同的：
静态库会在生成可执行程序的链接阶段被打包到可执行程序中，所以可执行程序启动，静态库就被加载到内存中了。
动态库在生成可执行程序的链接阶段不会被打包到可执行程序中，当可执行程序被启动并且调用了动态库中的函数的时候，动态库才会被加载到内存
因此，在cmake中指定要链接的动态库的时候，应该将命令写到生成了可执行文件之后：
# 添加并指定最终生成的可执行程序名
add_executable(app ${SRC_LIST})
# 指定可执行程序要链接的动态库名字
target_link_libraries(app pthread)
app: 对应的是最终生成的可执行程序的名字
pthread：这是可执行程序要加载的动态库，这个库是系统提供的线程库，全名为libpthread.so，在指定的时候一般会掐头（lib）去尾（.so）。
# 链接第三方动态库，假设在测试文件main.cpp中既使用了自己制作的动态库libcalc.so又使用了系统提供的线程库，此时CMakeLists.txt文件可以这样写：、
cmake_minimum_required(VERSION 3.0)
project(TEST)
file(GLOB SRC_LIST ${CMAKE_CURRENT_SOURCE_DIR}/*.cpp)
include_directories(${PROJECT_SOURCE_DIR}/include)
add_executable(app ${SRC_LIST})
target_link_libraries(app pthread calc)
pthread、calc都是可执行程序app要链接的动态库的名字。当可执行程序app生成之后并执行该文件，会提示有如下错误信息：
error while loading shared libraries: libcalc.so: cannot open shared object file: No such file or directory
这是因为可执行程序启动之后，去加载calc这个动态库，但是不知道这个动态库被放到了什么位置，所以就加载失败了，在 CMake 中可以在生成可执行程序之前，通过命令指定出要链接的动态库的位置，指定静态库位置使用的也是这个命令：
link_directories(path)
修改之后的CMakeLists.txt文件应该是这样的：
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

# 日志，在CMake中可以用message显示一条消息
message([STATUS|WARNING|AUTHOR_WARNING|FATAL_ERROR|SEND_ERROR] "message to display" ...)
(无) ：重要消息
STATUS ：非重要消息
WARNING：CMake 警告, 会继续执行
AUTHOR_WARNING：CMake 警告 (dev), 会继续执行
SEND_ERROR：CMake 错误, 继续执行，但是会跳过生成的步骤
FATAL_ERROR：CMake 错误, 终止所有处理过程
CMake的命令行工具会在stdout上显示STATUS消息，在stderr上显示其他所有消息。CMake的GUI会在它的log区域显示所有消息。
CMake警告和错误消息的文本显示使用的是一种简单的标记语言。文本没有缩进，超过长度的行会回卷，段落之间以新行做为分隔符。
# 输出一般日志信息
message(STATUS "source path: ${PROJECT_SOURCE_DIR}")
# 输出警告信息
message(WARNING "source path: ${PROJECT_SOURCE_DIR}")
# 输出错误信息
message(FATAL_ERROR "source path: ${PROJECT_SOURCE_DIR}")

# 变量操作
# 追加 -使用set拼接
如果使用set进行字符串拼接，对应的命令格式如下：
set(变量名1 ${变量名1} ${变量名2} ...)
将从第二个参数开始往后所有的字符串进行拼接，最后将结果存储到第一个参数中，如果第一个参数中原来有数据会对原数据就行覆盖。
# eg
set(TEMP "hello,world")
file(GLOB SRC_1 ${PROJECT_SOURCE_DIR}/src1/*.cpp)
file(GLOB SRC_2 ${PROJECT_SOURCE_DIR}/src2/*.cpp)
# 追加(拼接),将src1，src2，temp拼接为一个str存到src1中
set(SRC_1 ${SRC_1} ${SRC_2} ${TEMP})
message(STATUS "message: ${SRC_1}")

# 使用list拼接
list(APPEND <list> [<element> ...])
list命令的功能比set要强大，字符串拼接只是它的其中一个功能，所以需要在它第一个参数的位置指定出我们要做的操作，APPEND表示进行数据追加，后边的参数和set就一样了。
# 追加(拼接),APPEND后面同set的参数一致
list(APPEND SRC_1 ${SRC_1} ${SRC_2} ${TEMP})
message(STATUS "message: ${SRC_1}")
使用set命令可以创建一个list。一个在list内部是一个由分号;分割的一组字符串。例如，set(var a b c d e)命令将会创建一个list:a;b;c;d;e，但是最终打印变量值的时候得到的是abcde。
set(tmp1 a;b;c;d;e)
set(tmp2 a b c d e)
message(${tmp1})
message(${tmp2})
输出的结果:
abcde
abcde

# 字符串移除
在当前这么目录有五个源文件，其中main.cpp是一个测试文件。如果我们想要把计算器相关的源文件生成一个动态库给别人使用，那么只需要add.cpp、div.cp、mult.cpp、sub.cpp这四个源文件就可以了。此时，就需要将main.cpp从搜索到的数据中剔除出去，想要实现这个功能，也可以使用list
list(REMOVE_ITEM <list> <value> [<value> ...])
通过上面的命令原型可以看到删除和追加数据类似，只不过是第一个参数变成了REMOVE_ITEM。
cmake_minimum_required(VERSION 3.0)
project(TEST)
set(TEMP "hello,world")
file(GLOB SRC_1 ${PROJECT_SOURCE_DIR}/*.cpp)
# 移除前日志
message(STATUS "message: ${SRC_1}")
# 移除 main.cpp
list(REMOVE_ITEM SRC_1 ${PROJECT_SOURCE_DIR}/main.cpp)
# 移除后日志
message(STATUS "message: ${SRC_1}")
可以看到，在第8行把将要移除的文件的名字指定给list就可以了。但是一定要注意通过 file 命令搜索源文件的时候得到的是文件的绝对路径（在list中每个文件对应的路径都是一个item，并且都是绝对路径），那么在移除的时候也要将该文件的绝对路径指定出来才可以，否是移除操作不会成功。

关于list命令还有其它功能，但是并不常用，在此就不一一进行举例介绍了。
获取 list 的长度。
list(LENGTH <list> <output variable>)
LENGTH：子命令LENGTH用于读取列表长度
<list>：当前操作的列表
<output variable>：新创建的变量，用于存储列表的长度。

读取列表中指定索引的的元素，可以指定多个索引
list(GET <list> <element index> [<element index> ...] <output variable>)
<list>：当前操作的列表
<element index>：列表元素的索引
从0开始编号，索引0的元素为列表中的第一个元素；
索引也可以是负数，-1表示列表的最后一个元素，-2表示列表倒数第二个元素，以此类推
当索引（不管是正还是负）超过列表的长度，运行会报错
<output variable>：新创建的变量，存储指定索引元素的返回结果，也是一个列表。

将列表中的元素用连接符（字符串）连接起来组成一个字符串
list (JOIN <list> <glue> <output variable>)
<list>：当前操作的列表
<glue>：指定的连接符（字符串）
<output variable>：新创建的变量，存储返回的字符串

查找列表是否存在指定的元素，若果未找到，返回-1
list(FIND <list> <value> <output variable>)
<list>：当前操作的列表
<value>：需要再列表中搜索的元素
<output variable>：新创建的变量
如果列表<list>中存在<value>，那么返回<value>在列表中的索引
如果未找到则返回-1。

将元素追加到列表中
list (APPEND <list> [<element> ...])

在list中指定的位置插入若干元素
list(INSERT <list> <element_index> <element> [<element> ...])

将元素插入到列表的0索引位置
list (PREPEND <list> [<element> ...])

将列表中最后元素移除
list (POP_BACK <list> [<out-var>...])

将列表中第一个元素移除
list (POP_FRONT <list> [<out-var>...])

将指定的元素从列表中移除
list (REMOVE_ITEM <list> <value> [<value> ...])

将指定索引的元素从列表中移除
list (REMOVE_AT <list> <index> [<index> ...])

移除列表中的重复元素
list (REMOVE_DUPLICATES <list>)

列表翻转
list(REVERSE <list>)

列表排序
list (SORT <list> [COMPARE <compare>] [CASE <case>] [ORDER <order>])
COMPARE：指定排序方法。有如下几种值可选：
STRING:按照字母顺序进行排序，为默认的排序方法
FILE_BASENAME：如果是一系列路径名，会使用basename进行排序
NATURAL：使用自然数顺序排序
CASE：指明是否大小写敏感。有如下几种值可选：
SENSITIVE: 按照大小写敏感的方式进行排序，为默认值
INSENSITIVE：按照大小写不敏感方式进行排序
ORDER：指明排序的顺序。有如下几种值可选：
ASCENDING:按照升序排列，为默认值
DESCENDING：按照降序排列

# 宏定义
#ifdef DEBUG
    printf("我是一个程序猿, 我不会爬树...\n");
#endif
为了让测试更灵活，我们可以不在代码中定义所需定义的宏，而是在测试的时候去把它定义出来，其中一种方式就是在gcc/g++命令中去指定
$ gcc test.c -DDEBUG -o app
在gcc/g++命令中通过参数 -D指定出要定义的宏的名字，这样就相当于在代码中定义了一个宏，其名字为DEBUG。
在CMake中我们也可以做类似的事情，对应的命令叫做add_definitions:
add_definitions(-D宏名称)
# 自定义 DEBUG 宏
add_definitions(-DDEBUG)
add_executable(app ./test.c)

# cmake预定义宏
宏	功能
PROJECT_SOURCE_DIR			使用cmake命令后紧跟的目录，一般是工程的根目录
PROJECT_BINARY_DIR			执行cmake命令的目录
CMAKE_CURRENT_SOURCE_DIR	当前处理的CMakeLists.txt所在的路径
CMAKE_CURRENT_BINARY_DIR	target 编译目录
EXECUTABLE_OUTPUT_PATH		重新定义目标二进制可执行文件的存放位置
LIBRARY_OUTPUT_PATH			重新定义目标链接库文件的存放位置
PROJECT_NAME				返回通过PROJECT指令定义的项目名称
CMAKE_BINARY_DIR			项目实际构建路径，假设在build目录进行的构建，那么得到的就是这个目录的路径

```

### 执行cmake

```shell
# 在CMakeLists.txt所在目录执行
$ cmake .
# 在build目录执行
$ cmake ..
```

###  CMake 3.11 FetchContent模块

`FetchContent` 是 CMake 3.11 及以上版本中引入的一个功能，它允许你在构建时自动从外部获取依赖项，而不需要手动下载或预先安装它们。

#### 编写cmake：

```cmake
cmake_minimum_required(VERSION 3.14) # 确保使用了足够新的 CMake 版本

project(MyProject VERSION 1.0)

# 包含 FetchContent 模块
include(FetchContent)

# 声明 GoogleTest 作为外部依赖项
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        release-1.10.0 # GIT_TAG 参数可以是分支名或标签，不是必须的，但它是推荐的做法，不指定下载默认分支
)

# 使外部依赖项（GoogleTest）可用
FetchContent_MakeAvailable(googletest)

# 添加你的项目文件（替换为你的源文件）
add_executable(my_project main.cpp)

# 定义一个测试目标
enable_testing()

# 添加测试可执行文件
add_executable(
  my_test
  tests/test1.cpp
  tests/test2.cpp
)

# 链接 GoogleTest 到测试可执行文件
target_link_libraries(
  my_test
  gtest_main
)

# 包含 GoogleTest 的测试
include(GoogleTest)
gtest_discover_tests(my_test)

```

在这个示例中：

- 使用 `FetchContent_Declare` 声明了 GoogleTest 作为一个外部依赖项，指定了其 Git 仓库地址和要使用的标签（在这个例子中是 `release-1.10.0`）。
- 通过 `FetchContent_MakeAvailable` 自动下载（如果需要的话）、配置和构建 GoogleTest。
- 创建了两个可执行文件目标：一个是主项目 `my_project`，另一个是测试项目 `my_test`。
- `my_test` 测试可执行文件链接了 GoogleTest，并使用 `gtest_discover_tests` 自动发现和注册 GoogleTest 测试。

#### 第二步：编写测试

在 `tests` 目录下创建测试文件（例如，`test1.cpp` 和 `test2.cpp`），并使用 GoogleTest 编写测试。

#### 第三步：构建和运行测试

1. 创建一个构建目录并进入：

   ```bash
   mkdir build && cd build
   ```

2. 使用 CMake 配置项目并构建：

   ```bash
   cmake --build .
   ```

3. 运行测试：

   ```bash
   ctest
   ```

   

#### 使用catch2 v3.x版本的测试cmake

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
  src/sub.cpp
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

