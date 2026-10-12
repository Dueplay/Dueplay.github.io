---
title: "可扩展哈希表详解"
pubDate: 2024-12-03
categories: ['Database', 'Data Structure']
description: '深入讲解可扩展哈希（Extendible Hashing）的原理、工作流程和实现方式，包括目录扩容、桶分裂、全局深度与局部深度的概念，以及完整的插入示例'
---

## 原文

- [Extendible Hashing (Dynamic approach to DBMS)](https://www.geeksforgeeks.org/extendible-hashing-dynamic-approach-to-dbms/)

## 缩写

- eg. = exempli gratia 比如
- viz. = 即，也就是
- w.r.t = 关于(with respect to)
- aka = also know as 也称为

## 译文

**Extendible Hashing** is a dynamic hashing method wherein directories, and buckets are used to hash data. It is an aggressively flexible method in which the hash function also experiences dynamic changes. 

**Extendible Hashing** 是一种动态哈希方法，其中目录和桶被用于哈希数据。可扩展哈希是一个有力的灵活的方法,其中哈希函数也经历动态的改变。

**Main features of Extendible Hashing****:** The main features in this hashing technique are: 

 **Main features of Extendible Hashing****:  在哈希技术中主要的特征如下：**

- **Directories:** The directories store addresses of the buckets in pointers. An id is assigned to each directory which may change each time when Directory Expansion takes place.
- **目录:** 目录在指针中存储桶的地址。每个目录被分配一个`id` ，每次目录扩张时，`id`可能会发生变化。

- **Buckets:** The buckets are used to hash the actual data.
- **桶:** 桶被用于哈希真实的数据。

**Basic Structure of Extendible Hashing****:** 

可扩展哈希的基本结构

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=NjAzNzM5N2UzNWFkYWVlYWYyNGVjZGJlZDcyMzBiOGFfalB0azFlM2VMeXdYdThlWjVPWjVkd1R1ckpGV01VV1RfVG9rZW46Ym94Y255Tm1Dd0w5TWFROFZrTzkxVnI0Y3diXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

**Frequently used terms in Extendible Hashing****:**   

在可扩展哈希中常用术语

- **Directories:** These containers store pointers to buckets. Each directory is given a unique id which may change each time when expansion takes place. The hash function returns this directory id which is used to navigate to the appropriate bucket. Number of Directories = 2^Global Depth.
- **目录:** 这个容器存储指向桶的指针。每个目录给定一个唯一的id，当扩张发生时`id`可能随之改变。哈希函数返回这个目录的id，这个`id`被用来指向合适的桶。$$目录的数量 = 2^{全局深度}$$

- **Buckets:** They store the hashed keys. Directories point to buckets. A bucket may contain more than one pointers to it if its local depth is less than the global depth.
- **桶:**  它们存储哈希键。目录指向桶。如果局部深度小于全局深度时，一个桶可能包含不止一个指针指向它。

- **Global Depth:** It is associated with the Directories. They denote the number of bits which are used by the hash function to categorize the keys. Global Depth = Number of bits in directory id.
- **全局深度**：它跟目录相关联。它们表示哈希函数使用的比特位数目去分类这些键。全局深度=目录id的比特位数。

- **Local Depth:** It is the same as that of Global Depth except for the fact that Local Depth is associated with the buckets and not the directories. Local depth in accordance with the global depth is used to decide the action that to be performed in case an overflow occurs. Local Depth is always less than or equal to the Global Depth.
- **局部深度**：和全局深度类似，除了局部深度是跟桶关联，而不是跟目录。当桶溢出发生时，局部深度根据全局深度去决定执行的行为。局部深度通常小于等于全局深度。

- **Bucket Splitting:** When the number of elements in a bucket exceeds a particular size, then the bucket is split into two parts.
- **桶分裂**：当桶的元素超过了特定的大小，那么桶分裂成两个部分。

- **Directory Expansion:** Directory Expansion Takes place when a bucket overflows. Directory Expansion is performed when the local depth of the overflowing bucket is equal to the global depth.
- **目录扩容**：当桶溢出时，产生目录扩容。当溢出桶的局部深度等于全局深度时，目录扩容被执行。

 **Basic Working of Extendible Hashing****:** 

可扩展哈希基本工作流程

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=NGNlNzBiMzc5NjY2MTA3MDYwN2U4OWI3Y2NjZmU4YWZfeHp1anFyVzU3Zmo4VGZzV3JjR0xoTVgxMFFTZ3F4bXZfVG9rZW46Ym94Y25BTUxNeW9meGxydlNoeXF1UGxHbFNQXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

- **Step 1 – Analyze Data Elements:** Data elements may exist in various forms eg. Integer, String, Float, etc.. Currently, let us consider data elements of type integer. eg: 49.
- **步骤1 – 分析数据元素：**数据元素可能以各种形式存在，比如整型，字符串，浮点数等等...当前，我们考虑整形这类数据元素，比如49。

- **Step 2 – Convert into binary format:** Convert the data element in Binary form. For string elements, consider the ASCII equivalent integer of the starting character and then convert the integer into binary form. Since we have 49 as our data element, its binary form is 110001.
- **步骤2 - 转换成二进制形式：**将数据元素转换为二进制形式。对于字符串元素，考虑ASCII码起始字符的对应整数，然后转换成二进制形式。因为我们是将49作为数据元素，它的二进制形式是11001。

- **Step 3 – Check Global Depth of the directory.** Suppose the global depth of the Hash-directory is 3.
- **步骤3-检查目录的全局深度：**假设哈希目录的全局深度是3。

- **Step 4 – Identify the Directory:** Consider the 'Global-Depth' number of LSBs in the binary number and match it to the directory id.  Eg. The binary obtained is: 110001 and the global-depth is 3. So, the hash function will return 3 LSBs of 110**001** viz. 001.
- **步骤4 - 识别目录：**考虑在二进制下最低"全局深度"位，然后去匹配目录id。比如，二进制是：110001，全局深度是3，所以哈希函数会返回110**001**最后三位，即001。

- **Step 5 – Navigation:** Now, navigate to the bucket pointed by the directory with directory-id 001.
- **步骤5 - 导航**：现在，访问目录id=001指向的桶。

- **Step 6 – Insertion and Overflow Check:** Insert the element and check if the bucket overflows. If an overflow is encountered, go to **step 7** followed by **Step 8**, otherwise, go to **step 9**.
- **步骤6 – 插入和溢出检查：**插入元素并且检查桶是否溢出。如果遇到溢出，转向步骤7和步骤8，否则转到步骤9。

- **Step 7 – Tackling Over Flow Condition during Data Insertion:** Many times, while inserting data in the buckets, it might happen that the Bucket overflows. In such cases, we need to follow an appropriate procedure to avoid mishandling of data.  First, Check if the local depth is less than or equal to the global depth. Then choose one of the cases below. 
- **步骤7– 处理数据插入过程中的溢出情况:**  很多情况下，当在桶里插入数据时，可能发生桶溢出。在这种情况下，我们需要采取下面合适的流程去避免误操作数据。首先，检查局部深度是否小于或等于全局深度。然后选择下述情况之一。

- **Case1:** If the local depth of the overflowing Bucket is equal to the global depth, then Directory Expansion, as well as Bucket Split, needs to be performed. Then increment the global depth and the local depth value by 1. And, assign appropriate pointers.  Directory expansion will double the number of directories present in the hash structure.
- **情况1:** 如果溢出桶的本地深度等于全局深度，那么需要执行目录扩张和桶分裂。然后全局深度和局部深度的值增加1，并且指定合适的指针。目录扩张会double哈希结果中的目录数量。

- **Case2:** In case the local depth is less than the global depth, then only Bucket Split takes place. Then increment only the local depth value by 1. And, assign appropriate pointers. 
- **情况2:** 如果本地深度小于全局深度，那么仅仅发生桶分裂。然后仅仅把局部深度增加1。并且指定合适的指针。

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=YmExZTZlMzM1MDZiMzYyZTBiYjlhNTVjOWQ5NTcxYzVfYzNmUFB2OUwzbDh4cm5kVk15T0F0MTFXSk1TbmtLdklfVG9rZW46Ym94Y25WSFlBQ1M0Vmc3Zk9mYlVBMThFR2dmXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

- **Step 8 – Rehashing of Split Bucket Elements:** The Elements present in the overflowing bucket that is split are rehashed w.r.t the new global depth of the directory.
- **步骤8-分裂桶的元素重新哈希**：在被分裂的溢出桶中呈现的元素会根据目录的全局深度进行重新哈希。

- **Step 9 –** The element is successfully hashed.
- **步骤9** - 元素被成功哈希。

## 示例

**Example based on Extendible Hashing:** Now, let us consider a prominent example of hashing the following elements: **16,4,6,22,24,10,31,7,9,20,26.** 

**基于可扩展哈希的样例****：**现在让我们考虑一个哈希以下元素的典型样例：**16,4,6,22,24,10,31,7,9,20,26。（共11个元素）**

 **Bucket Size:** 3 (Assume) 

**桶大小：**3（假设）

 **Hash Function:** Suppose the global depth is X. Then the Hash Function returns X LSBs.   

**哈希函数：**假设全局深度是X，那么哈希函数返回X的最低位。

- **Solution:** First, calculate the binary forms of each of the given numbers.  
- 16- 10000 
-  4- 00100 
-  6- 00110 
-  22- 10110 
-  24- 11000  
- 10- 01010  
- 31- 11111  
- 7- 00111 
-  9- 01001  
- 20- 10100  
- 26- 11010
- **解决方案：**首先，计算每个给定数值的二进制形式。
- Initially, the global-depth and local-depth is always 1. Thus, the hashing frame looks like this:   
- 首先，全局深度和局部深度总是1。因此哈希图看起来像这样：

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=NWI2NDBlMWFlODQ1MWJmZGY1NzA2Y2M5ZWEyYTk4YjBfYjREMGdWb0FuYVdJa0FOaUptMWJYemxaYUIzdTdLazNfVG9rZW46Ym94Y25uRG8xbTgzMTh1QzB2Q01MbXZuQm5lXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

- **Inserting 16:**  The binary format of 16 is 10000 and global-depth is 1. The hash function returns 1 LSB of 1000**0** which is 0. Hence, 16 is mapped to the directory with id=0.   
- **Inserting 16:**  16的二进制形式是10000，且全局深度是1。哈希函数返回1000**0**最低1位为0。因此，16映射到目录的`id=0`。

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=NDY5Y2M4NTQwNWIwZjM2NTIxODViYzI5OTJlY2ZkNDRfdkNvT1RUYjFCN2E0bU5kYjRTY09KbXFvUlhyYlRJYXBfVG9rZW46Ym94Y25McGVHQjlMemFBOXZwWWZENGJ4ZmVyXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

- **Inserting 4 and 6:**  Both 4(10**0**) and 6(11**0**)have 0 in their LSB. Hence, they are hashed as follows:   
- **插入4和6：**4(10**0**) and 6(11**0**)的最低1位都是0。因此，他们哈希结果如下：

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=MGQ1Mzc4NTA2OGE5MjMzM2FlMWNjNmQ3MjA2Yzg2ZTBfa2VERUlmRkljUU1JWWlWTTdXUGRORE9kQ053U1J5MmRfVG9rZW46Ym94Y25RM21hQ09iMGg0T3NvWENZODFBbjRmXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

- **Inserting 22:** The binary form of 22 is 1011**0**. Its LSB is 0. The bucket pointed by directory 0 is already full. Hence, Over Flow occurs.   
- **插入22：**22的二进制形式是1011**0。**它的最低位是0。目录0指向的桶已经满了。因此溢出发生了。

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=MmVhM2EwYjg3MTcxMWNkMjRiNmZlMWRhYTdiZGMyYjJfZWNONHN3bGVUcnNydnJqdzRab0lGM0d2YXdwVGtiT0VfVG9rZW46Ym94Y25mV0RXSDRGMWdLT1RjSVNmWE4zU3ZoXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

- As directed by **Step 7-Case 1**, Since Local Depth = Global Depth, the bucket splits and directory expansion takes place. Also, rehashing of numbers present in the overflowing bucket takes place after the split. And, since the global depth is incremented by 1, now,the global depth is 2. Hence, 16,4,6,22 are now rehashed w.r.t 2 LSBs.[ 16(100**00**),4(1**00**),6(1**10**),22(101**10**) ] 
-  正如**Step 7-Case 1**指示的，因为局部深度=全局深度，桶分裂且目录扩张。同时，分裂之后在溢出的桶中重新哈希数值。并且因为全局深度增加了1，所以现在全局深度是2。因此，16,4,6,22 被重新哈希为最低2位。[ 16(100**00**),4(1**00**),6(1**10**),22(101**10**) ] 

![img](https://ym9omojhd5.feishu.cn/space/api/box/stream/download/asynccode/?code=NDFmYzgxYjNjZTA1ZTZiOGJmZDY2MzQyYzZmNzllZGVfMnFXdGhDbmxmWG55OHhPY0VWaGFyWWVYRm53NkJBaVlfVG9rZW46Ym94Y24xZU1kNTNONm1lSndFb2V3TVNJQUJlXzE2OTY4MTg2MTg6MTY5NjgyMjIxOF9WNA)

> **Notice that the bucket which was underflow has remained untouched. But, since the number of directories has doubled, we now have 2 directories 01 and 11 pointing to the same bucket. This is because the local-depth of the bucket has remained 1. And, any bucket having a local depth less than the global depth is pointed-to by more than one directories.*
>
> 注意，未溢出的桶存在没有触及的。但是，因为目录的数量已经翻倍，我们现在有2个目录01和11指向了同一个桶。这是因为桶的局部深度保持为1。并且，任何局部深度小于全局深度的桶会被不止一个目录指向。

<!-- CONTINUATION_MARKER_3 -->
