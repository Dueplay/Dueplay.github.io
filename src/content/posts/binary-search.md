---
title: '二分查找与三分查找'
date: 2024-03-28
categories: ['Data Structure']
description: '详解二分查找和三分查找算法的原理和应用'
---

## 二分查找

### 能够进行二分的前提

- 目标函数具有单调性（单调递增或者递减）
- 存在上下界（bounded）
- 能够通过索引访问

### 最简单的一种：在递增序列里查找指定值 target

```cpp
int left = 0, right = n - 1;
while (left <= right) {
    int mid = (left + right) / 2;
    if (array[mid] == target) {
        // found
        break or return mid;
    }
    if (array[mid] < target) {
        left = mid + 1;
    } else {
        right = mid - 1;
    }
}
```

### 第二种情形

- **lower_bound**：第一个 >= target 的数
- **upper_bound**：第一个 > target 的数（后继）

如果要查找 lower_bound 和 upper_bound，存在的问题是：

- 给定的 target 不一定在数组中存在
- array[mid] 即使不等于 target，也可能是最后的答案，不能将 mid 排除。因为查找的是 >=，mid >= target，mid 所以不能被排除。

### 解决方法

采用最严谨的划分，一侧包含，一侧不包含，终止于 left == right

**查找 lower_bound**：第一个 >= target 的数，即在所有 >= target 的数里选最小的

```cpp
int left = 0, right = n; // target 不存在则返回无效值 n
while (left < right) {
    int mid = (left + right) >> 1; // >> 1 等效 / 2
    // 1.先写条件满足的分支
    // mid >= target，mid 后面肯定 > target，要找 >= 里最小的，所以往前找，然后 mid 也不能排除 
    if (array[mid] >= target) {
        right = mid; // 2.改变范围，看 mid 前面还有没有 >= target 的
    } else {
        left = mid + 1;
    }
}
return right;
```

array[mid] >= target 改为 array[mid] > target 就是 upper_bound，大于里面最小的。

**查找最后一个 <= target 的数**，不存在则返回 -1。即在所有 <= target 的数里选最大的。

```cpp
int left = -1, right = n - 1;
while (left < right) {
    int mid = (left + right + 1) >> 1; // 3.如果是 left = mid，则需要 + 1，不然要死循环
    // 1.先写条件满足的分支
    if (array[mid] <= target) {
        left = mid; // 2.改变范围，看后面还有没有 <= target 的
    } else {
        right = mid - 1;
    }
}
return right;
```

**(left + right + 1) 为啥要 +1**？考虑这种情况：

[3, 4]，l 指向 3，r 指向 4，不加一的情况 mid 指向 3，如果走第一个分支，l = mid，不就死循环了嘛。如果 +1，mid 指向 4，走第一个分支 l = mid，l 和 r 相等，退出循环；走第二个分支，r = mid - 1，l 和 r 相等，退出循环。

array[mid] <= target 改为 array[mid] < target 则是查找 target 前驱，即最后一个 < target 的数。

**注意**：left 和 right 的取值，在答案一定存在的情况下，取 [0, n-1]。

如果答案不一定存在，可以取 [-1, n-1] 或者 [0, n]，-1 和 n 表示不存在的情况。

## 三分查找

可以在单峰（只有一个波峰 or 波谷）的函数中寻找极值（极大 or 极小值）

也可用于求函数的局部极大/极小值

**要求**：函数是分段严格单调递增/递减的（**不能出现一段平的情况**）

以求单峰函数 f 的极大值为例，可在定义域 L 上取任意两点 lmid, rmid

- 若 f(lmid) <= f(rmid)，则函数必然在 lmid 处单调递增，极值在 [lmid, r] 上
- 若 f(lmid) > f(rmid)，则函数必然在 rmid 处单调递减，极值在 [l, rmid] 上

lmid, rmid 可取三等分点，每次能排除 1/3

也可取 lmid 为二等分点，rmid 为 lmid 稍加一点偏移量，这样更快一点，相当于每次能排除一半

lmid < rmid 有两种情况，但可以确定极值一定在 lmid 右侧。
