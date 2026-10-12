---
title: '字典树与并查集'
pubDate: 2024-03-15
categories: ['Data Structure']
description: '字典树（Trie树）和并查集（Disjoint Set）的原理与实现'
---

## 字典树(Trie树)

字典树(Trie树)是一种由"结点"和"带有字符的边"构成的树形结构。

典型应用是用于统计和排序大量的字符串(但不仅限于字符串)，经常被搜索引擎系统用于文本词频统计。

它的优点是：最大限度地减少无谓的字符串比较，查询效率比哈希表高。

### 基本结构

1. **第一种**：节点存储完整单词，占用空间大。

2. **第二种**：子节点存储用于存储单词的额外信息，如频次，从根节点到某一节点，路径上经过的字符连接起来为该节点对应的单词。

### 内部实现

**1. 字符集数组法(简单)**

每个结点保存一个长度固定为字符集大小(例如26)的数组，以字符为下标，保存指向的结点。

空间复杂度为 O(结点数 * 字符集大小)，查询的时间复杂度为 O(单词长度)。

适用于较小字符集，或者单词短、分布稠密的字典。不然浪费很多空间。

**2. 字符集映射法(优化)**

把每个结点上的字符集数组改为一个映射（词频统计用 hash map，排序用 ordered map）。

空间复杂度为 O(文本字符总数)，查询的时间复杂度为 O(单词长度)，但常数稍大一些，适用性更广。

### 核心思想

Trie 树的核心思想是**空间换时间**：

- 无论是保存树的结构、字符集数组还是字符集映射，都需要额外的空间
- 利用字符串的公共前缀来降低查询时间的开销以达到提高效率的目的
- 分组思想——前缀相同的字符串在同一子树中

### 代码实现

```cpp
class Trie {
public:
    Trie() {
        root = new Node();
    }
    
    void insert(string word) {
        solve(word, true, false);
    }
    
    bool search(string word) {
        return solve(word, false, false);
    }
    
    bool startsWith(string prefix) {
        return solve(prefix, false, true);
    }

    // 三个函数有很多可以复用的地方
    bool solve(string& word, bool insertIfNoExist, bool searchPrefix) {
        Node *cur = root;
        for (char& c : word) {
            if (cur->child.find(c) == cur->child.end()) {
                // 是插入
                if (insertIfNoExist) {
                    cur->child.insert({c, new Node()});
                } else {
                    return false;
                }
            }
            cur = cur->child[c];
        }
        if (insertIfNoExist) cur->count++;
        if (searchPrefix) return true;
        else return cur->count > 0;
    }

private:
    class Node {
    public:
        unordered_map<char, Node*> child;
        int count;
        Node() {
            count = 0;
        }
    };
    Node *root;
};
```

## 并查集(Disjoint Set)

### 基本用途

1. 处理不相交集合的合并和查询问题
2. 处理分组问题
3. 维护无序二元关系

### 基本操作

**MakeSet(s)**：建立一个新的并查集，其中包含 S 个集合，每个集合里只有一个元素。

**UnionSet(x,y)**：把元素 X 和元素 Y 所在的集合合并。要求 X 和 Y 所在的集合不相交，如果相交则无需合并。

**Find(x)**：找到元素 X 所在的集合的代表。该操作也可以用于判断两个元素是否位于同一个集合，只要将它们各自的代表比较一下就可以了。

### 路径压缩

并查集本质上只关心每个结点所在的集合，不关心该集合对应的树形结构具体是怎样的。

而一个结点所在的集合由根结点确定，因此在 Find(x) 的同时把 X 和它的所有祖先直接连到根结点上，下一次就可以一步走到根了，减少下次查询的时间。

### 内部实现

每个集合是一个树形结构。

每个结点只需要保存一个值：它的父结点。

最简单的实现是只用一个 int 数组 fa，fa[i] 表示编号为 i 的结点的父结点。

根结点的 fa 等于它自己。

### 代码实现

```cpp
class DisjointSet {
public:
    DisjointSet(int n) {
        fa = vector<int>(n, 0);
        for (int i = 0; i < n; i++) fa[i] = i;
    }

    int find(int x) {
        if (x == fa[x]) return x;
        // 这里可分为两步来写
        // 1. fa[x] = find(fa[x]), 路径压缩，更改 x 的父节点为根
        // 2. 返回 x 的父节点，fa[x]
        return fa[x] = find(fa[x]);
    }

    void unionSet(int x, int y) {
        x = find(x), y = find(y);
        // 两个集合的根节点不同，则不在一个集合。需合并
        if (x != y) fa[x] = y;
    }

private:
    vector<int> fa;
};
```

### 相关题目

- [547. 省份数量](https://leetcode-cn.com/problems/number-of-provinces/)
- [130. 被围绕的区域](https://leetcode-cn.com/problems/surrounded-regions/)
- [200. 岛屿数量](https://leetcode-cn.com/problems/number-of-islands/)

## 字符串算法

### atoi 实现

```cpp
int myAtoi(string s) {
    // 1. 跳过空格
    int index = 0;
    while (index < s.size() && s[index] == ' ') index++;

    // 2. 判断符号，只用一次就行
    int sign = 1;
    if (index < s.size() && (s[index] == '-' || s[index] == '+')) {
        if (s[index] == '-') sign = -1;
        else sign = 1;
        index++;
    }

    int val = 0;
    int min = -2147483648, max = 2147483647;
    
    // 3. 是数字
    while (index < s.size() && (s[index] >= '0' && s[index] <= '9')) {
        // 整数越界处理
        // 溢出：val * 10 + (s[index] - '0') > max
        // 前面可能溢出，因此移项处理
        if (val > (max - (s[index] - '0')) / 10) {
            return sign == -1 ? min : max;
        }
        val = val * 10 + (s[index] - '0');
        index++;
    }
    return val * sign;
}
```

### Rabin-Karp 算法

Rabin-Karp 是一种基于 Hash 的高效的字符串搜索算法。

**问题**：给定长度为 n 的字符串 s（文本串），长度为 m 的字符串 t（模式串），求 t 是否在 s 中出现过（t 是否为 s 的子串）。

**朴素**：O(nm)，遍历 s，截取子串与 t 对比。

**Rabin-Karp 算法**：O(n + m)

**思路**：计算 s 的每个长度为 m 的子串的 Hash 值（一个宽度为 m 的滑动窗滑过 s），检查是否与 t 的 Hash 值相等。

### 核心思想

选用的 Hash 函数：将字符串看作是一个 b 进制数，计算字符串（在十进制下）对 p 取模的值。

取 b = 131，p = 2^64 - 1

选取的 b 和 p 的值决定了 Hash 函数的质量。根据经验，b = 131, 13331 等，p 为大质数，p = 1e9 + 7 等，冲突概率极小。

**Hash 值相等时可以再比对一下两个字符串，避免 Hash 碰撞问题**。

### 如何快速计算子串的 hash 值

先计算前缀子串的 hash 值，用 O(n) 空间保存。H[i] 表示前 i 个字符组成的子串的 hash 值。

𝐻[𝑖] = Hash (𝑠 [0 … 𝑖 − 1] ) = (𝐻 [𝑖 − 1] ∗ 𝑏 + 𝑠 [𝑖 − 1] ) mod p

**结论**：

s[l,r] 表示从 l 位置开始到 r 截止的子串，其 hash 值为：

**Hash (𝑠 [𝑙 … 𝑟] ) = ( 𝐻 [𝑟 + 1] − 𝐻 [𝑙] ∗ 𝑏^(𝑟−𝑙+1) ) mod 𝑝**

### 代码实现

```cpp
class Solution {
public:
    int strStr(string haystack, string needle) {
        if (needle.empty()) return 0;
        if (haystack.size() < needle.size()) return -1;

        // 1. 求文本串 s 前缀子串 hash
        vector<unsigned int> H;
        haystack = ' ' + haystack; // 下标从 1 开始
        needle = ' ' + needle;
        H.push_back(0); 
        for (int i = 1; i < haystack.size(); i++) {
            H.push_back(H[i-1] * 131 + haystack[i] - 'a' + 1);
        }

        // 2. 求模式串 t 的 hash 值
        unsigned int tHash = 0;
        vector<unsigned int> p131; // p131[i] = 131^i
        p131.push_back(1);
        for (int i = 1; i < needle.size(); i++) {
            tHash = tHash * 131 + needle[i] - 'a' + 1;
            p131.push_back(p131[i-1] * 131);
        }

        // 3. 滑动窗口中子串 s[l..r] hash 值与模式串的 hash 值相比
        int n = needle.size() - 1;
        for (int r = n; r < haystack.size(); r++) {
            // 避免 hash 冲突(概率很小)，进一步对比子串
            if ((H[r] - H[r - n] * p131[n]) == tHash && 
                haystack.substr(r - n + 1, n) == needle.substr(1, n)) {
                return r - n;
            }
        }
        return -1;
    }
};
```

Rabin-Karp 算法的广泛适用性：由于 Rabin-Karp 算法 O(n) 预处理 + O(1) 求出任意子串哈希值的特性，配合二分查找、二分答案等技巧，可以作为字符串匹配、回文等一系列问题的次优解。
