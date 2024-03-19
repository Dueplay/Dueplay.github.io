---
title: "namespace，using，重载，extern c"
date: 2021-02-22T18:50:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["c++"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "c++语法中命名空间，using，重载，extern关键字"
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


#### 1.::作用域运算符

**可用::对被屏蔽的同名的全局变量进行访问**

后面有::的名称一定是类名或命名空间名。直接::代表全局作用域下

通常情况下，如果有两个同名变量，一个是全局变量，另一个是局部变量，那么局部变量在其作用域内具有较高的优先权，它将屏蔽全局变量（就近原则）。

```
//全局变量
int a = 10;
void test(){
	//局部变量
	int a = 20;
	//全局a被隐藏
	cout << "a:" << a << endl;
}

```

程序的输出结果是a:20。在test函数的输出语句中，使用的变量a是test函数内定义的局部变量，因此输出的结果为局部变量a的值。

**作用域运算符可以用来解决局部变量与全局变量的重名问题** 

```
//全局变量
int a = 10;
//1. 局部变量和全局变量同名
void test(){
	int a = 20;
	//打印局部变量a
	cout << "局部变量a:" << a << endl;
	//打印全局变量a
	cout << "全局变量a:" << ::a << endl;
}

```

这个例子可以看出，作用域运算符可以用来解决局部变量与全局变量的重名问题，**即在局部变量的作用域内，可用::对被屏蔽的同名的全局变量进行访问。**

#### 2.namespace

1.命名空间用途：解决名称冲突

在game1和game2中都有相同名称的goAtk函数，如果不使用命名空间，会有二义性，编译报错。

```
#include <iostream>
using namespace std;
#include "game1.h"
#include "game2.h"

void test01(){
	LOL::goAtk();
	KingGlory::goAtk();
}
int main() {
	test01();
	system("pause");
	return 0;

}
```

game1.h中

```
#pragma once
#include <iostream>
using namespace std;
//lol
namespace LOL {
	void goAtk();
}

```

game1.cpp中

```
#include "game1.h"

void LOL::goAtk()
{
	cout << "lol的攻击函数" << endl;
}

```

game2.h中

```
//王者荣耀
namespace KingGlory {
	void goAtk();
}
```

运行结果：

![image-20220222130944700](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220222130944700.png)

2.命名空间下可以存放：变量，函数，结构体，类。

3.命名空间必须声明在全局的作用域下。

4.命名空间可以嵌套命名空间。

5.命名空间是开放的，可以随时添加新的成员。

6.命名空间可以是匿名的

7.命名空间可以取别名

```
//2.命名空间下可以存放：变量，函数，结构体，类
namespace A 
{
	int m_A = 10;
	void func();
	struct Person{};
	class Animal{};
}
//3.命名空间必须声明在全局的作用域下。在局部中定义会报错:不允许进行命名空间定义
void test02() {
	/*namespace b 
	{
	};*/
}
//4.命名空间可以嵌套命名空间。
namespace B
{
	int m_A = 20;
	namespace C
	{
		int m_A = 30;
	}
}
void test03()
{
	cout << "B命名空间下的m_A = " << B::m_A << endl;//20
	cout << "C命名空间下的m_A = " << B::C::m_A << endl;//30
}
//5.命名空间是开放的，可以随时添加新的成员。
namespace B
{
	int m_B = 40;
}//这段代码不会与上面的B冲突，而是合二为一
void test04() {
	cout << "B命名空间下的m_A = " << B::m_A << endl;//20
	cout << "B命名空间下的m_B = " << B::m_B << endl;//40
}
//6.命名空间可以是匿名的
namespace
{
	int m_C = 50;
	int m_D = 50;
}
void test05() {
	cout << "m_C = " << m_C << endl;//50
	cout << "m_D = " << ::m_D << endl;//50
}
//7.命名空间可以取别名
namespace veryLongName
{
	int m_A = 100;
}
void test06()
{
	namespace veryShortName = veryLongName;
	cout << veryLongName::m_A << endl;//100
	cout << veryShortName::m_A << endl;//100
}
```

#### 3.using声明和using编译指令

在开发中通常不自己写命名空间

```
#include <iostream>
using namespace std;

namespace LOL
{
	int sunWuKongId = 1;
}
namespace KingGlory
{
	int sunWuKongId = 3;
}
void test01()
{
	//int sunWuKongId = 2;

	//1.using声明
	//注意：using声明和就近原则不要同时出现，尽量避免
	//using声明导致“LOL::sunWuKongId”的多次声明

	using LOL::sunWuKongId;//告诉编译器使用的是sunWuKongId是LOL里的。
	cout << sunWuKongId << endl;
}
void test02()
{
	//int sunWuKongId = 2;
	//2.using编译指令
	//注意：using编译指令和就近原则同时出现，优先使用就近原则
	//当使用多个using编译指令，并且出现同名情况，使用数据依然加作用域,不加则不明确
	using namespace LOL;
	using namespace KingGlory;
	cout << LOL::sunWuKongId << endl;
	cout << KingGlory::sunWuKongId << endl;

}
int main() {
	test02();
	system("pause");
	return 0;
}
```

报错：无法解析的外部命令。是在链接阶段出错了.

#### 4.函数重载原理

编译器为了实现函数重载，也是默认为我们做了一些幕后的工作，编译器用不同的参数类型来修饰不同的函数名，比如void func();编译器可能将函数名修饰成_func,当编译器碰到void func(int x)，编译器可能将函数名修饰为__func_int;当编译器碰到void func(int x,char c)；编译器可能会将函数名修饰为_func_int_char;我这里使用”可能”这个字眼是因为编译器如何修饰重载的函数名称并没有一个统一的标准，所以不同的编译器可能会产生不同的内部名。

```
void func(){}
void func(int x){}
void func(int x,char y){}

```

 以上三个函数在linux下生成的编译之后的函数名为:

_Z4funcv //v 代表void,无参数

_Z4funci //i 代表参数为int类型

_Z4funcic //i 代表第一个参数为int类型，第二个参数为char类型

#### 5.extern “C”浅析

主要用途：c++中调用c语言的文件

以下在Linux下测试:

```
c函数: void MyFunc(){} ,被编译成函数: MyFunc
c++函数: void MyFunc(){},被编译成函数: _Z6Myfuncv

```

通过这个测试，由于c++中需要支持函数重载，所以c和c++中对同一个函数经过编译后生成的函数名是不相同的，这就导致了一个问题，如果在c++中调用一个使用c语言编写模块中的某个函数，那么c++是根据c++的**名称修饰方式**来查找并链接这个函数，那么就会发生链接错误，以上例，在c++中调用MyFunc函数，在链接阶段会去找Z6Myfuncv，结果是没有找到的，因为这个MyFunc函数是c语言编写的，生成的符号是MyFunc。

那么如果我想在c++调用c的函数怎么办？

extern "C"的主要作用就是为了实现c++代码能够调用其他c语言代码。加上extern "C"后，这部分代码编译器按c语言的方式进行**编译**和**链接**，而不是按c++的方式。

```
#ifdef __cplusplus//如果c++编译器在编译这个文件的时候，会有__cplusplus宏，就会将下面代码用c方式链接
extern "C" {//告诉编译器，这个{}中的代码都用c语言的方式来链接
#endif

#include <stdio.h>

	void show();

#ifdef __cplusplus
}
#endif
```



```
#include "test.h"

void show()
{
	printf("hello world\n");
}

```

```
#include <iostream>
using namespace std;
#include "test.h"

//解决方法1.
//告诉编译器 利用c语言的方式链接show函数，这种方式就不用包含头文件了,适合一个函数的情况
//extern "C" void show();

//解决方法2：在.h中添加6行代码
void test01() {
	show();//show函数是在c语言编写的模块中，编译器如果按照c++的方式去找show，
	       //可能将函数名称修饰为_Z4showv的形式，再去调用。在编译时用c++得方式去链接这个函数
	       //找的其实是_Z4showv这个名称，找不到这个函数的实现体。
}
int main() {
	test01();
	system("pause");
	return 0;

}
```

