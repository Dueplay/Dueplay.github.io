---
title: linux基础知识
date: 2021-03-20T15:30:09+08:00
# weight: 1
# aliases: ["/first"]
tags: ["linux"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "linux基础知识"
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

## 一、目录

1./bin：可执行二进制文件的目录，绿色是可执行文件，

输入命名./date，date可执行文件执行。cat命令，查看文本文件内容，ctrl+c退出。

2./boot：linux启动时用到的文件。reboot：重启。

3./dev：存放设备文件，一切皆文件。

sudo cat mice鼠标移动，输出。

sudo临时获得一次管理员权限，cat是查看文件，mice是鼠标文件。

4./etc：os相关的一些配置文件。cat passwd查看密码。

5./home：用户的家目录会存在这。Linux系统支持多用户访问。~表示当前用户的家目录。

6./lib：系统使用的函数库的目录。

7./root：系统管理员的家目录。普通用户的家目录：/home/cookie。

切换成管理员账户，sudu su。退出 exit。

切换普通用户：su 用户名。退出 exit。

cookie（用户名）@（at在）主机名：当前工作目录$(普通用户)#（管理员）

cd空格 回车：回到当前用户的“家”目录，宿主目录，这个用户的所有数据。不是home。

cd空格 - 回到上次工作目录。

8./tmp：一般用户或正在执行的程序临时存放文件的目录。

9./usr：unix system resource，应用程序存放目录。

## 二、文件类型

linux下不以后缀名区分文件类型。ls -l 查看文件详细信息。

普通文件-

目录文件d

套接字文件s

软链接文件l

字符设备文件c

块设备文件b

管道文件p

![image-20220613101418983](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613101418983.png)

第一个为文件类型，后面9个，三个一组，r可读，w可写，x可执行。分别为文件所有者权限，所属组权限，其他人的权限。数字2代表硬链接计数。第一个cookie为文件所有者，第二个是所属组。文件所占用的空间大小（byte），最后一次修改时间，文件名。

gedit 文件名：用记事本编辑文件。

## 三、命令

命令格式：命令 -可选 参数

查看帮助文档：ls --help；man 1 xxx：1是标准命令，2是系统调用，3是库函数

ctrl+p/n 上/下一条命令

ctrl+u 清空

ctrl+b 光标向前移动一个字符

ctrl+a 光标移动到最前

ctrl+e 光标移动到最后

通配符：ls std*.h  ls std??.h *代表一堆，？代表一个字符。

![image-20220613110739350](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613110739350.png)

输出重定向：>

![image-20220613110949699](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613110949699.png)

追加>>

![image-20220613111158446](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220613111158446.png)

删除：rm -f强制删 ；rm -r 递归删（无敌），删目录时必须用这个。

建立链接文件ln

查看或合并文件内容：cat，合并要借助重定向。

拷贝文件：cp 文件名 目录/新名字

拷贝目录，cp -a保留原有文件格式，创建时间没变；cp -r递归的拷贝，重新创建新的。

移动文件：mv（移动文件和改名作用） mv 文件名 目录（目录不存在则把文件名改为目录的名字）

file：查看文件类型。

![image-20220614084626924](C:\Users\asus\AppData\Roaming\Typora\typora-user-images\image-20220614084626924.png)

归档管理（压缩打包）：tar zcvf（gzip格式压缩） xxx.tar.gz（压缩包名）  yyy1 yyy2 yyy3（yyy为打包材料）

tar.gz可以不加，但不直观。 z是gzip方式压缩，c是创建，v是展示压缩列表啥东西被打包了，f是指定压缩文件名。

tar jcvf（bzip2格式压缩） xxx.tar.bz2（压缩包名）  yyy1 yyy2 yyy3（yyy为打包材料）

解压：tar z(j)xvf 压缩包名

查看命令位置：which ls

修改文件权限：r：4  w：2 x：1 

7==rwx 5==w-x

chmod 755 file1

修改目录里面的所有文件的权限

chmod 777 dir -R：将dir里面的文件权限全部改为rwx

查看进程：ps aux

杀掉经常：kill -9 进程id

## 四、vim



