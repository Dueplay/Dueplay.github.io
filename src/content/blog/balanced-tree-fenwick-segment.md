---
title: "平衡树、树状数组与线段树"
pubDate: 2024-12-03
categories: ["数据结构与算法"]
description: "深入讲解AVL树、红黑树等平衡二叉搜索树，以及树状数组和线段树这两种高效的区间查询数据结构。"
---

## 平衡二叉搜索树

### 二叉搜索树(BST)

二叉搜索树(Binary Search Tree)是一颗满足下面性质的二叉树：

- 任意节点的关键码 >= 它左子树中所有节点的关键码
- 任意节点的关键码 <= 它右子树中所有节点的关键码

BST的中序遍历一定是一个递增有序序列

查询/插入/求前驱/求后继/删除操作的时间复杂度：

随机数学期望O(log N)

在非随机数据上，BST容易退化为O(N), 即一条链的情况

保证性能的关键：左右子树平衡

旋转：更改一对父子关系

左旋：父节点变为子节点的左孩子，子节点的左孩子(若有)变为父节点的右孩子。

右旋：父节点变为子节点的右孩子，子节点的右孩子(若有)变为父节点的左孩子。

### AVL树

平衡因子 Balance Factor

一个结点的左子树的高度 减去 它的右子树的高度。

AVL 树 

- **任意结点的平衡因子的绝对值都不超过1**，即balance factore{-1,0,1}
- 每个结点需要保存: 原始数据、左子结点、右子结点、子树高度

AVL树在插入、删除时，沿途更新结点的高度值

当平衡因子的绝对值大于1时，触发树结构的修正，通过旋转操作来进行平衡

#### 四种旋转场景

AVL树的平衡操作主要有四种情况：

1. **LL型**（左-左）：在左子树的左子树插入导致失衡，需要右旋
2. **RR型**（右-右）：在右子树的右子树插入导致失衡，需要左旋
3. **LR型**（左-右）：在左子树的右子树插入导致失衡，需要先左旋再右旋
4. **RL型**（右-左）：在右子树的左子树插入导致失衡，需要先右旋再左旋

### 红黑树

红黑树(Red-blackTree)是一种**近似平衡**的**二叉搜索树**

- 从根到叶子的最长路径 ≤ 2*最短路径(简记:高度差在2倍以内

规则:

每个结点要么是红色，要么是黑色

根结点是黑色

最底层视作有一层空叶结点，是黑色的

不能有两个相邻的红色结点

从任一结点到其每个叶子的所有路径都包含相同数目的黑色结点

规则被打破时，通过变色或旋转操作来修正

有非常多的情况需要讨论

**相比AVL树，红黑树插入删除更快(旋转少)、更省空间(颜色vs平衡因子)**

**查询稍慢(不如AVL树更加平衡)**

红黑树是许多语言中有序集合、有序映射(例如C++set,map的内部实现方式

## 树状数组

树状数组(Binary Indexed Tree, or Fenwick Tree)是一种维护数组前缀和，区间和的数据结构。思想和跳表类似

- 跳表：添加索引，高效维护链表
- 树状数组：添加索引，高效维护数组

### 如何建立索引？

树状数组的一个节点索引的原始数据数量，与该节点编号在二进制下最低位的1有关

- 1,3,5,7，... 二进制下以1结尾，仅索引一个数据(自身)
- 2,6,10,14，... 二进制下以10结尾，索引2(二进制10)个数据(自身以及它前面的1个)
- 4,12，.... 二进制下以100结尾，索引4(二进制100)个数据(自身以及它前面的3个)

> 定义lowbit(x)为x二进制下最低位的1和后面的0组成的数值，也就是将一个数二进制分解下的最小次幂。
>
> **lowbit(x) = x & (~x + 1) = x & -x**
>
> - lowbit(7) = lowbit(111) = 1 = 1
> - lowbit(12) = lowbit(1100) = 100 = 4

### 树状数组性质

树状数组 c 的节点c[x]存储x前面 lowbit(x) 个数据(包括x)的和。

每个内部节点c[x] 保存以它为根的子树中所有叶子节点的和。

除树根外，每个内部节点 c[x] 的父亲是 c[x + lowbit(x)]。

树的深度为 O(logN)

如果N 不是2的整次幂，那么树状数组就是一个具有同样性质的森林结构。

### 查询

树状数组支持的第一个基本操作：查询前缀和

根据整数的二进制分解，可以把任意区间[1,x]拆成 O(logN)个小区间

- 13 = 8 + 4 + 1= 1000 + 100 + 1
- [1, 13] 可以拆成[1,8], [9, 12], [13,13]
- 对应二进制：[1,1000],[1001, 1100],[1101, 1101]

规律：

13前面的lowbit(13) = 1个数，对应区间[13, 13], 再往前一个数是12

12前面lowbit(12) = 4 个数，对应区间[9, 12], 再往前一个数是8

8前面lowbit(8) = 8 个数，对应区间[1, 8]，结束

```c++
int query(int x) { // 查询前x个数据的和
	int ans = 0;
	for (; x > 0; x -= x & -x) ans += c[x];
	return ans;
}
```

区间和(第l~r个数据的和) 可以直接由query(r) - query(l - 1)得到

时间复杂度为O(logN) -- 循环次数不超过二进制位数

### 更新

树状数组支持的第二个基本操作：单点增加，即把某个数据x增加一个值delta

需要更新的索引就是c[x]以及它的所有祖先节点，至多O(logN)个

利用性质：每个内部节点 c[x] 的父亲是 c[x + lowbit(x)]。

```c++
void add(int x, int delta) { // x增加一个值delta
	for (; x <= n; x += x & -x) c[x] += delta;
}
```

时间复杂度为O(logN) 

如果需要修改一个数据，可以先计算差值，再执行add操作

题目：https://leetcode-cn.com/problems/range-sum-query-mutable/

### 局限性

树状数组有实现简单、效率高、省空间等诸多优势
但也有很大的局限性：

- 维护的信息需要满足区间减法性质，不然无法通过前缀和相减得到区间和
  例如无法直接拿来维护区间最值
  
- 不能很好地支持修改操作
  单点修改需要先求出差值，转化为增加操作
  基本上难以支持区间修改(修改连续的一段数据)
  
### 代码

```c++
class FenwickTree {
public:
    FenwickTree(vector<int>& nums) {
        n = nums.size();
        a = vector<int>(n + 1, 0);
        c = vector<int>(n + 1, 0);
        // 树状数组下标从1开始
        for (int i = 1; i <= n; i++) {
            a[i] = nums[i - 1];
            add(i, nums[i - 1]);
        }
    }
    void update(int index, int val) {
        index++;
        int delta = val - a[index];
        add(index, delta);
        a[index] = val;
    }
    // 注意l，r下标从1开始还是从0开始
    int query(int l, int r) {
        l++;
        r++;
        return query(r) - query(l - 1);
    }
private:
    vector<int> a, c;
    int n;
    void add(int x, int delta) {
        for (; x <= n; x += x & -x) c[x] += delta;
    }
    int query(int x) {
        int ans = 0;
        for (; x > 0; x -= x & -x) ans += c[x];
        return ans;
    }
};
```



## 线段树

线段树(Segment Tree)是一种基于分治思想的二叉树结构，用于在区间上进行信息统。

- 线段树的每个节点都代表一个闭区间。
- 线段树具有唯一的根节点，代表的区间是整个统计范围，如[1,N]
- 线段树的每个叶节点都代表一个长度为1的区间 [x,x]。
- 对于每个内部节点[l,r]，它的左子节点是[l,mid]，右子节点是[mid+1,r]，其中mid=(l+r)/2 (向下取整)

除去树的最后一层，整棵线段树一定是一棵完全二叉树，树的深度为 O(logN)
可以按照与二叉堆类似的"父子2倍"节点编号方法

- 根节点编号为1

- 编号为p的节点的左子节点编号为p * 2，右子节点编号为p*2+1。

这样一来，就能简单地使用数组来保存线段树

由于最后一层不一定是连续的，保存线段树的数组长度不要小于4N

### 区间最值问题

维护一个序列，支持:

- 查询区间最值(第l个数到第r个数的最大值)

- 单点修改(更新第 x个数据)

- 区间统一修改(把第l个数到第r个数都置为 val)

利用利用线段树来解决，每个节点维护区间[l, r]和对应的data，这里data是我们想维护的内容，可以是[l, r]的和也可以是[l, r]的max

```c++
struct Node {
	int l, r; // 区间[l, r]
	int data; // 维护的内容
    int mark; // 延迟修改标记
}
```

#### 建树

Build(1, 1, 10)：递归的一个过程

时间复杂度O(n) -- 不超过节点数4n

#### 单点修改

Change(1,x, v) 将x位置改为v

- 从根(1号)结点出发，递归找到代表区间[x, x]的叶子结点
- 自底向上更新保存的信息

时间复杂度 0(log(n)) -- 每层一个结点，更新总次数不超过树高

#### 区间查询

Query(1，l，r)，从根结点(1号结点)开始递归查询:

- 若[l,r]完全覆盖了当前结点代表的区间，则立即回溯，并且该结点的 data 值为候选答案。

- 若左(右)子结点与[l,r]有重叠部分，则递归访问左(右)子结点。

时间复杂度 0(log(n))--l,r各在树上划分出一条边界，最多形成 2log(n)个候选区间

蓝色是与l，r有重叠的，递归访问其子节点

红色是[l, r]完全覆盖的

#### 区间修改

区间查询与修改的区别:

- 区间查询遇到完全覆盖的区间，可以直接返回，最多处理2logn个结点
- 对于完全覆盖的区间，区间修改会影响它的所有子结点，时间复杂度最坏O(n)

解决方案: 懒惰标记(又称延迟标记) -- 类似二叉堆的懒惰删除

- 遇到完全覆盖的区间，先打一个修改标记，只要不到子结点中查询，就不往下继续修改
- 在以后的递归查询/修改中遇到了标记，再往下传递一层

时间复杂度优化到 0(log(n))

### 代码

```c++
class SegmentTree {
public:
    SegmentTree(vector<int>& nums) {
        n = nums.size();
        a = vector<Node>(4 * n);
        build(1, 0, n - 1, nums);
    }
    void Change(int index, int val) {
        change(1, index, val);
    }
    int Query(int l, int r) {
        return query(1, l, r);
    }
private:
    struct Node {
        int l;
        int r;
        int sum;
        int mark;
    };
    int n;
    vector<Node> a;
    void build(int curr, int l, int r, vector<int>& nums) {
        a[curr].l = l;
        a[curr].r = r;
        a[curr].mark = 0;
        // 递归边界，叶子节点
        if (l == r) {
            a[curr].sum = nums[l];
            return;
        }
        int mid = (l + r) >> 1;
        // 分两半，递归
        build(curr * 2, l, mid, nums);
        build(curr * 2 + 1, mid + 1 , r, nums);
        // 回溯时，自底向上统计信息
        a[curr].sum = a[curr * 2].sum + a[curr * 2 + 1].sum;
    }
    // 单点修改，先递归找到，然后自底向上统计信息
    void change(int curr, int index, int val) {
        if (a[curr].l == a[curr].r) {
            a[curr].sum = val;
            return;
        }
        spread(curr);
        int mid = (a[curr].l + a[curr].r) >> 1;
        if (index <= mid) change(curr * 2, index, val);
        else change(curr * 2 + 1, index, val);
        a[curr].sum = a[curr * 2].sum + a[curr * 2 + 1].sum;
    }
    // 区间修改
    void change(int curr, int l, int r, int delta) {
        if (l <= a[curr].l && a[curr].r <= r) {
            // 修改这个被完全包含区间的信息
            a[curr].sum += (a[curr].r - a[curr].l + 1) * delta;
            // 子树不改了，标记一下
            a[curr].mark += delta;
        }
        spread(curr);
        int mid = (a[curr].l + a[curr].r) >> 1;
        if (l <= mid) change(curr * 2, l, r, delta);
        if (r > mid) change(curr * 2 + 1, l, r, delta);
        a[curr].sum = a[curr * 2].sum + a[curr * 2 + 1].sum;
    }
    void spread(int curr) {
        if (a[curr].mark != 0) { // 有标记,修改子树节点
            a[curr * 2].sum += a[curr].mark * (a[curr * 2].r - a[curr * 2].l + 1);
            a[curr * 2].mark += a[curr].mark;
            a[curr * 2 + 1].sum += a[curr].mark * (a[curr * 2 + 1].r - a[curr * 2 + 1].l + 1);
            a[curr * 2 + 1].mark += a[curr].mark;
            a[curr].mark = 0;
        }
    }
    // 递归求区间和
    // 完全包含：直接返回，否则：左右划分
    int query(int curr, int l, int r) {
        // 查询的是  [l     ,     r]
        // curr结点是[a[curr].l, a[curr].r]
        // l  a[curr].l  a[curr].r  r
        if (l <= a[curr].l && a[curr].r <= r) return a[curr].sum;
        spread(curr);
        int mid = (a[curr].l + a[curr].r) >> 1;
        int ans = 0;
        if (l <= mid) ans += query(curr * 2, l, r);
        if (r > mid) ans += query(curr * 2 + 1, l, r);
        return ans;
    }
};
```
