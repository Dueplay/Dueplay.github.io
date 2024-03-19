---
title: gcc和c库的制作
date: 2021-08-19T15:43:43+08:00
# weight: 1
# aliases: ["/first"]
tags: ["gcc"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "如何制作静态库和动态库"
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

## 一、gcc编译流程

源文件->预处理->编译->汇编->链接->可执行文件

1.预处理：cpp，宏替换，头文件展开，去掉注释。gcc -E hello.c -o hello.i

2.编译：将.c文件通过gcc编译成汇编语言文件。gcc -S hello.i  -o hello.s

3.汇编：将汇编文件通过汇编器as变成二进制文件。gcc -c hello.s -o hello.o

4.链接：将hello.o中所调用的库文件通过链接器ld链接到一起，成可执行文件。gcc hello.o -o hello 

一步到位：gcc hello.c -o hello 或gcc -o hello hello.c

生成目标文件（.o文件）gcc -c hello.c -o hello.o（不写-o就默认生成hello.o）

## 二、库的制作

### 1.静态库

​	将源文件编译成目标文件 gcc -c add.c sub.c div.c mul.c

​	将.o文件打包成库 ar rcs libmath.a  add.o sub.o div.o mul.o

​	使用库文件 gcc -o main main.c -I头文件的路径 -L库的路径 -l库名

### 2.动态库

​	将源文件编译成目标文件 gcc -fpic -c add.c sub.c div.c mul.c

​	将.o文件打包成库gcc -shared add.o sub.o div.o mul.o -o libmath.so

​	使用库文件 gcc -o main main.c -I头文件的路径 -L库的路径 -l库名（链接器ld）

#### 3.加载动态库时报错

​	系统加载可执行代码时候, 能够知道其所依赖的库的名字, 但是还需要知道所依赖的库的绝对路径。此时就需要系统动态载入器ldd。

​	在~/.bashrc文件中添加你的动态库的路径（配置环境变量LD_LIBRARY_PATH）

​    export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:库路径

​	

