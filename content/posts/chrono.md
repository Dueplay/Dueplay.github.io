---
title: chrono库的使用
date: 2022-05-23T13:42:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["c++11"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "c++11新引入的chrono库介绍和使用"
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

chrono库主要包含三种类型的类：时间间隔duration、时钟clocks、时间点time point

### 1.duration

用来记录时间长度，可以表示几秒、几分钟、几个小时的时间间隔

```c++
// duration的定义，定义于头文件 <chrono>
template<
    class Rep,
    class Period = std::ratio<1>
> class duration; //表示Rep个Period，一个period是一个ratio类，默认为1s
// ratio的定义，定义于头文件 <ratio>
template<
    std::intmax_t Num,
    std::intmax_t Denom = 1
> class ratio; // 代表 Num / Denom 秒，分母默认为1，ratio<2>代表一个时钟周期是2秒
```

为了方便使用，在标准库中定义了一些常用的时间间隔,定义如下

```c++
纳秒：using std::chrono::nanoseconds = duration<Rep*/*Rep至少 64 位的有符号整数类型*/*, std::nano>;
     std::nano 为 ratio<1,10e9>
微秒：std::chrono::microseconds	duration<Rep*/*至少 55 位的有符号整数类型*/*, std::micro>
毫秒：std::chrono::milliseconds	duration<Rep*/*至少 45 位的有符号整数类型*/*, std::milli>
秒： std::chrono::seconds	duration<Rep*/*至少 35 位的有符号整数类型*/*>
分钟：std::chrono::minutes	duration<Rep*/*至少 29 位的有符号整数类型*/*, std::ratio<60>>
    std::chrono::minutes m(1);//表示1m
小时：std::chrono::hours	duration<Rep*/*至少 23 位的有符号整数类型*/*, std::ratio<3600>>
```

构造函数

```c++
// 1. 拷贝构造函数
duration( const duration& ) = default;
// 2. 通过指定时钟周期的类型来构造对象
template< class Rep2 >
constexpr explicit duration( const Rep2& r );
// 3. 通过指定时钟周期类型，和时钟周期长度来构造对象
template< class Rep2, class Period2 >
constexpr duration( const duration<Rep2,Period2>& d );

// 还重载了以下操作符
operator=;
operator+;
operator-;
operator++;
operator++(int);
operator--;
operator--(int);
+=,-=,*=,/=,%=;

//获取时间间隔的时钟周期个数
constexpr rep count() const;
   
```

example

```c++
std::chrono::hour h(2);// h表示2小时的时间间隔对象
std::chrono::millisecond ms{3};// ms表示3毫秒
std::chrono::duration<int,ratio<60>> ten_m(3); // 3个60秒
std::chrono::duration<double,ratio<1,1000>> ms_(5.5); // 5.5个1ms，也计是5.5ms

std::chrono::minute t1(1);
std::chrono::second t2(20);
std::chrono::second t3 = t1 - t2;//1m - 30s = 30s,t3为30s
```

duration的加减运算有一定的规则，当两个duration时钟周期不相同的时候，会先统一成一种时钟，然后再进行算术运算，统一的规则如下：假设有ratio<x1,y1> 和 ratio<x2,y2>两个时钟周期，首先需要求出x1，x2的最大公约数X，然后求出y1，y2的最小公倍数Y，统一之后的时钟周期ratio为ratio<X,Y>。分子求公约，分母求公倍。因为是x1 / y1 - x2 / y2,就通分呗，化为 X/Y,x1/y1可以表示为多少个 X/Y， x2 / y2同理。

ratio<9, 7>和ratio<6, 5>，统一之后的时钟周期ratio<3, 35>，一个ratio<9, 7>就表示为15个ratio<3, 35>，而ratio<6, 5>可表示为14个ratio<3, 35>。单位就统一了。

### 2.时间点 time point

一个表示时间点的类，定义如下

该类通常配合clock一起使用

```c++
// 定义于头文件 <chrono>
template<
    class Clock,
    class Duration = typename Clock::duration
> class time_point;
// Clock：此时间点time_point在此时钟Clock上计量
// 用于计量从纪元起时间的 std::chrono::duration 类型，表示从clock时间持续duration段时间的时间点

// 构造函数
// 1. 构造一个以新纪元(epoch，即：1970.1.1)作为值的对象，需要和时钟类一起使用，不能单独使用该无参构造函数
time_point();
// 2. 构造一个对象，表示一个时间点，这个时间点为从epoch开始持续d这么一个时间间隔，需要和时钟类一起使用，不能单独使用该构造函数
explicit time_point( const duration& d );
// 3. 拷贝构造函数，构造与t相同时间点的对象，使用的时候需要指定模板参数
template< class Duration2 >
time_point( const time_point<Clock,Duration2>& t );

//用来获得1970年1月1日到time_point对象中记录的时间点经过的时间间隔（duration），函数原型如下：
duration time_since_epoch() const;
// 此外还有很多重载operator
```

### 3.时钟Clock

chrono库中提供了获取当前的系统时间的时钟类，包含的时钟一共有三种：

system_clock：系统的时钟，系统的时钟可以修改，甚至可以网络对时，因此使用系统时间计算时间差可能不准。
steady_clock：是固定的时钟，相当于秒表。开始计时后，时间只会增长并且不能修改，适合用于记录程序耗时
high_resolution_clock：和时钟类 steady_clock 是等价的，精度更高（是它的别名）。


每个时钟类内部成员有time_point、duration、Rep、Period等信息，基于这些信息来获取当前时间，以及实现time_t和time_point之间的相互转换。

**在使用chrono提供的时钟类的时候，不需要创建类对象，直接调用类的静态方法就可以得到想要的时间了。**

#### 3.1system_clock

定义

```c++
struct system_clock { 
    // using 定义别名
    using rep                       = long long;
    using period                    = ratio<1, 10'000'000>; // 100 纳秒
    using duration                  = chrono::duration<rep, period>;//时间间隔为rep*period 100纳秒
    using time_point                = chrono::time_point<system_clock>; //时间点通过系统时钟做了初始化
    static constexpr bool is_steady = false;

    _NODISCARD static time_point now() noexcept 
    { // get current time，返回表示当前时间的时间点。
        return time_point(duration(_Xtime_get_ticks()));
    }

    _NODISCARD static __time64_t to_time_t(const time_point& _Time) noexcept 
    { // convert to __time64_t，将 time_point 时间点类型转换为 std::time_t 类型
        return duration_cast<seconds>(_Time.time_since_epoch()).count();
    }

    _NODISCARD static time_point from_time_t(__time64_t _Tm) noexcept 
    { // convert from __time64_t，将 std::time_t 类型转换为 time_point 时间点类型
        return time_point{seconds{_Tm}};
    }
};
```

example

```c++
#include <chrono>
#include <iostream>
int main()
{
    // 新纪元1970.1.1时间
    std::chrono::system_clock::time_point epoch;

    
    std::chrono::duration<int,std::ratio<60 * 60 * 24>> day(1);
    // 新纪元1970.1.1时间 + 1天
    std::chrono::system_clock::time_point ppt(day);

    using day_t = std::chrono::duration<int, std::ratio<60 * 60 * 24>>;
    // 新纪元1970.1.1时间 + 10天
    // std::chrono::time_point需要指定模板参数
    std::chrono::time_point<std::chrono::system_clock,day_t> t(day_t(10));

    // 系统当前时间
    // std::chrono::system_clock::time_point = chrono::time_point<system_clock>
    std::chrono::system_clock::time_point today = std::chrono::system_clock::now();
    
    // 转换为time_t时间类型
    time_t tm = std::chrono::system_clock::to_time_t(today);
    std::cout << "今天的日期是:    " << ctime(&tm);

    time_t tm1 = std::chrono::system_clock::to_time_t(today+day);
    std::cout << "明天的日期是:    " << ctime(&tm1);

    time_t tm2 = std::chrono::system_clock::to_time_t(epoch);
    std::cout << "新纪元时间:      " << ctime(&tm2);

    time_t tm3 = std::chrono::system_clock::to_time_t(ppt);
    std::cout << "新纪元时间+1天:  " << ctime(&tm3);

    time_t tm4 = std::chrono::system_clock::to_time_t(t);
    std::cout << "新纪元时间+10天: " << ctime(&tm4);
}

```

#### 3.2 steady_clock

想要获取程序耗时的时长，可以使用syetem_clock，因为这个时间可以跟随系统的设置发生变化。

steady_clock相当于秒表，只要启动就会进行时间的累加，并且不能被修改，

定义

```c++
struct steady_clock { // wraps QueryPerformanceCounter
    using rep                       = long long;// 通过long long整形来记录时钟周期的个数
    using period                    = nano;// 时钟周期为1纳秒
    using duration                  = nanoseconds; // 时间间隔为1ns
    using time_point                = chrono::time_point<steady_clock>; // 通过steady_clock对时间点进行初始化
    static constexpr bool is_steady = true;

    // get current time
    _NODISCARD static time_point now() noexcept 
    { 
        // doesn't change after system boot
        const long long _Freq = _Query_perf_frequency(); 
        const long long _Ctr  = _Query_perf_counter();
        static_assert(period::num == 1, "This assumes period::num == 1.");
        const long long _Whole = (_Ctr / _Freq) * period::den;
        const long long _Part  = (_Ctr % _Freq) * period::den / _Freq;
        return time_point(duration(_Whole + _Part));
    }
};

```

example

```c++
#include <chrono>
#include <iostream>
int main()
{
    // 获取开始时间点
    std::chrono::steady_clock::time_point start = std::chrono::steady_clock::now();
    // 需要获取程序耗时的代码段
    std::cout << "print 1000 stars ...." << std::endl;
    for (int i = 0; i < 1000; ++i)
    {
        std::cout << "*";
    }
    std::cout << std::endl;
    // 获取结束时间点
    std::chrono::steady_clock::time_point last = std::chrono::steady_clock::now();
    // 计算差值，是一个时间间隔
    auto dt = last - start;
    // dt.count()返回时间间隔中有多少个时钟周期
    std::cout << "总共耗时: " << dt.count() << "纳秒" << std::endl;
    std::cout << "总共耗时: " << dt.count() / (double)1000000 << "ms" << std::endl;
}
```

#### 3.3 high_resolution_clock

high_resolution_clock提供的时钟精度比system_clock要高，它也是不可以修改的。在底层源码中，这个类其实是steady_clock类的别名

```c++
using high_resolution_clock = steady_clock;
```

因此使用方式和steady_clock是一样的

### 4.转换函数

#### 4.1duration_cast

duration_cast是chrono库提供的一个模板函数，这个函数不属于duration类。通过这个函数可以对duration类对象内部的时钟周期Period，和周期次数的类型Rep进行修改。

定义如下：

```c++
template <class ToDuration, class Rep, class Period>
  constexpr ToDuration duration_cast (const duration<Rep,Period>& dtn);
// 返回目标类型ToDuration的时间间隔
```

注意：

如果是对时钟周期进行转换：源时钟周期必须能够整除目的时钟周期（比如：小时到分钟）。
如果是对时钟周期次数的类型进行转换：低等类型默认可以向高等类型进行转换（比如：int 转 double）。
如果时钟周期和时钟周期次数类型都变了，根据第二点进行推导（也就是看时间周期次数类型）。
以上条件都不满足，那么就需要使用 duration_cast 进行显示转换，比如小的时钟周期转大的时钟周期。

example

```c++
#include <chrono>
#include <iostream>
void f(){
    std::cout << "print 1000 stars ...." << std::endl;
    for (int i = 0; i < 1000; ++i)
    {
        std::cout << "*";
    }
    std::cout << std::endl;
}
int main()
{
    // 获取开始时间点
    std::chrono::steady_clock::time_point start = std::chrono::steady_clock::now();
    // 需要获取程序耗时的代码段
   	f();
    // 获取结束时间点
    std::chrono::steady_clock::time_point last = std::chrono::steady_clock::now();
    
    // 计算差值，是一个为多少ns的时间间隔
    auto dt = last - start;
    // dt.count()返回时间间隔中有多少个时钟周期
    std::cout << "总共耗时: " << dt.count() << "纳秒" << std::endl;
    
    // 转换
    // 整数时长：时钟周期纳秒转毫秒，小转大，并且是int转int，所以不能直接转，要求 duration_cast
    auto int_ms = std::chrono::duration_cast<std::chrono::milliseconds>(dt);
     // 小数时长：int转double，符合第二点，虽然是小转大但不要求 duration_cast
    std::chrono::duration<double, std::ratio<1, 1000>> fp_ms = dt;
    
    std::cout << "f() took " << fp_ms.count() << " ms, "
        << "or " << int_ms.count() << " whole milliseconds\n"<< std::endl;

}
```

#### 4.2 time_point_cast

time_point_cast也是chrono库提供的一个模板函数，这个函数不属于time_point类。函数的作用是对时间点进行转换，因为不同的时间点对象内部的时钟周期Period，和周期次数的类型Rep可能也是不同的，一般情况下它们之间可以进行隐式类型转换，也可以通过该函数显示的进行转换。

定义：

```c++
template <class ToDuration, class Clock, class Duration>
time_point<Clock, ToDuration> time_point_cast(const time_point<Clock, Duration> &t);

```

example

```c++
#include <chrono>
#include <iostream>

// 定义别名
using Clock = std::chrono::high_resolution_clock;
using Ms = std::chrono::milliseconds;
using Sec = std::chrono::seconds;
template<class Duration>
using TimePoint = std::chrono::time_point<Clock, Duration>;//clock类型为high_resolution_clock

void print_ms(const TimePoint<Ms>& time_point)
{
    std::cout << time_point.time_since_epoch().count() << " ms\n";
}

int main()
{
    TimePoint<Sec> time_point_sec(Sec(6));
    // 无精度损失, 可以进行隐式类型转换
    TimePoint<Ms> time_point_ms(time_point_sec);
    print_ms(time_point_ms);    // 6000 ms

    time_point_ms = TimePoint<Ms>(Ms(6789));
    // error，会损失精度，不允许进行隐式的类型转换
    TimePoint<Sec> sec(time_point_ms);

    // 显示类型转换,会损失精度。6789 truncated to 6000
    time_point_sec = std::chrono::time_point_cast<Sec>(time_point_ms);
    print_ms(time_point_sec); // 6000 ms
}
```

