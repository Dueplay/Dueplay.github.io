---
title: '二叉搜索树与二叉堆'
date: 2024-03-20
categories: ['Data Structure']
description: '二叉搜索树（BST）和二叉堆的原理、实现和应用'
---

## 二叉搜索树 BST

二叉搜索树(Binary Search Tree)是一棵满足如下性质（BST 性质）的二叉树：

1. 任意结点的关键码 >= 它左子树中所有结点的关键码
2. 任意结点的关键码 <= 它右子树中所有结点的关键码

根据以上性质，二叉搜索树的**中序遍历必然为一个有序序列**。

### 建立 BST

为了避免越界，减少边界情况的特殊判断，一般在 BST 中额外插入两个保护结点：

- 一个关键码为正无穷（一个很大的正整数）
- 一个关键码为负无穷

仅由这两个结点构成的 BST 就是一棵初始的空 BST，然后再将各个节点插入这颗初始的 BST。

### 检索

检索关键码 val 是否存在，从根开始递归查找：

- 若当前结点的关键码等于 val，则已经找到
- 若关键码大于 val，递归检索左子树（或不存在）
- 若关键码小于 val，递归检索右子树（或不存在）

```cpp
bool checkValInBST(TreeNode* root, int val) {
    if (root == nullptr) return false;
    if (root->val == val) {
        return true;
    }
    if (val < root->val) {
        return checkValInBST(root->left, val);
    } else {
        return checkValInBST(root->right, val);
    }
}
```

### 插入

插入 val 与检索 val 的过程类似：

- 若检索发现存在，则放弃插入（或者把 val 对应结点的计数+1，视要求而定）
- 若检索发现不存在（子树为空），直接在对应位置新建关键码为 val 的结点

```cpp
TreeNode* insertIntoBST(TreeNode* root, int val) {
    if (root == nullptr) {
        return new TreeNode(val);
    }
    if (val < root->val) {
        // 左子树不为空返回左子树本身，为空创建新节点
        root->left = insertIntoBST(root->left, val);
    } else {
        root->right = insertIntoBST(root->right, val);
    }
    return root;
}

// 迭代方法，找到要插入的位置
TreeNode* insertIntoBST(TreeNode* root, int val) {
    if (root == nullptr) {
        return new TreeNode(val);
    }
    TreeNode *cur = root, *fa = root;
    while (cur != nullptr) {
        fa = cur;
        cur = val < cur->val ? cur->left : cur->right; // 查找要插入的位置
    }
    if (val < fa->val) 
        fa->left = new TreeNode(val);
    else
        fa->right = new TreeNode(val);
    return root;
}
```

### 前驱和后继

- **前驱**：BST 中小于 val 的最大结点
- **后继**：BST 中大于 val 的最小结点

求前驱和后继也是基于检索的，先检索 val。以后继为例：

- 如果检索到了 val，并且 val 存在右子树，则在右子树中一直往左走到底，即右子树上最左边的节点
- 否则说明没找到 val 或者 val 没有右子树，此时前驱就在检索过程经过的结点中（即当前结点的所有祖先节点中大于 val 的最小节点，可以拿一个变量记录）

```cpp
// 找一个节点的后继有两种情况
// 1. 该节点有右子树，那么后继则是右子树一路向左
// 2. 该节点没有右子树，那么后继存在于访问该节点的路径上，为大于该节点的最小节点
TreeNode* inorderSuccessor(TreeNode* root, int val) {
    if (root == nullptr) return nullptr;
    TreeNode *ans = nullptr;
    while (root != nullptr) {
        // 记录访问节点路径上大于节点的最小值
        if (root->val > val) {
            if (ans == nullptr || root->val < ans->val) {
                ans = root;
            }
        }
        
        if (root->val == val) {
            // case1, 有右子树，右子树上一路向左
            if (root->right) {
                root = root->right;
                while (root->left != nullptr) {
                    root = root->left;
                }
                return root;
            }
            // 没有右子树，则为 case2
            break;
        }
        // 查找该节点
        if (val < root->val) root = root->left;
        else root = root->right;
    }
    return ans;
}
```

### 删除

从 BST 中删除关键码为 val 的结点，可以基于检索+求后继实现。

首先检索 val，然后分为下面两种情况：

**1. 删除节点左右子树有为空的**，用不为空的一边顶替该节点，把子树和父结点相连就行了。也包含叶子节点的情况，左右子树都为空，也可以归于这类。

**2. 删除节点左右子树都不为空**，则寻找该节点其前驱或后继替代该节点。先删除后继，再用后继结点代替 val 的位置。后继的删除即是在节点的右子树上删除后继节点，属于第一种情况（因为后继是右子树一直往左走到底，所以它最多只会有一棵子树，其左子树为空）。

```cpp
TreeNode* deleteNode(TreeNode* root, int key) {
    if (root == nullptr) return nullptr;
    if (root->val == key) {
        // case1. 左右子树有为 null 的
        if (root->left == nullptr) return root->right;
        if (root->right == nullptr) return root->left;
        
        // case2. 找后继
        TreeNode *next = root->right;
        while (next->left != nullptr) {
            next = next->left;
        }
        // 用后继替代
        root->val = next->val;
        // 转为在右子树上删除后继
        root->right = deleteNode(root->right, next->val);
        return root;
    }

    if (key < root->val) {
        // 递归，在左子树上删除该节点
        root->left = deleteNode(root->left, key);
    } else {
        root->right = deleteNode(root->right, key);
    }
    return root;
}
```

### 时间复杂度分析

查询/插入/求前驱/求后继/删除操作的时间复杂度：

- 随机数据期望 O(树高) = O(log N)
- 在非随机数据上，BST 容易退化为 O(N)，一般都要结合旋转操作来进行平衡

## 堆

堆(Heap)是一种高效维护集合中最大或最小元素的数据结构。

- **大根堆**：根节点最大的堆，用于维护和查询 max
- **小根堆**：根节点最小的堆，用于维护和查询 min

堆是一棵二叉树，并且满足堆性质（Heap property）：

- 大根堆：任意结点的关键码 >= 它**所有**子结点的关键码
- 小根堆：任意结点的关键码 <= 它**所有**子结点的关键码

## 二叉堆

二叉堆是堆的一种简易实现，本质上是一棵满足堆性质的**完全二叉树**。

### 常见操作

- 建堆 (build): O(N)
- 查询最值 (get max/min): O(1)
- 插入 (insert): O(log N) 树高，最多上浮树高次
- 取出最值 (delete max/min): O(log N) 树高，最多下沉树高次

### 实现二叉堆

二叉堆一般使用一个一维数组来存储，利用完全二叉树的结点编号特性。

**假设第一个元素存储在索引(下标)为 1 的位置**：

- 索引为 p 的结点的左孩子的索引为 p*2
- 索引为 p 的结点的右孩子的索引为 p*2+1
- 索引为 p 的结点的父亲的索引为 p/2（下取整）

**假设第一个元素存储在索引(下标)为 0 的位置**：

- 索引为 p 的结点的左孩子的索引为 p*2+1
- 索引为 p 的结点的右孩子的索引为 p*2+2
- 索引为 p 的结点的父亲的索引为 (p-1)/2（下取整）

### 插入 (insert)

新元素一律插入到数组的尾部，插入到索引为 p 的位置，然后向上进行一次调整 HeapifyUp：

- 若已到达根，停止
- 若满足堆性质（heap[p] <= heap[p/2]，大顶堆），停止
- 否则交换 heap[p] 和 heap[p/2]，令 p=p/2，继续调整

### 取出堆顶 (extract / delete max)

把堆顶（heap[0]）与堆尾（heap[n-1]）交换，删除堆尾（数组最后一个元素 O(1)），然后从根向下进行一次调整（Heapify Down）：

- 每次与左、右子结点中较大的一个比较，检查堆性质，不满足则交换
- 注意判断子结点是否存在

### 代码实现

```cpp
// 堆结点（key 用于比较的关键码，listNode 可以是任意的附带信息）
struct Node {    
    int key;    
    ListNode* listNode;    
    Node(int key, ListNode* listNode) : key(key), listNode(listNode) {}
};

class BinaryHeap {
public:
    bool empty() {
        return heap.empty();
    }

    void push(const Node& node) {
        // 插入到尾部
        heap.push_back(node);
        // 当前插入位置向上调整
        int p = heap.size() - 1;
        heapifyUp(p);
    }

    // 返回堆顶元素，小顶堆维护的最小值
    Node pop() {
        Node ans = heap[0];
        // 末尾交换到头部，然后删除末尾 O(1)
        heap[0] = heap[heap.size() - 1];
        heap.pop_back();
        // 向下调整
        heapifyDown(0);
        return ans;
    }

    // 删除下标为 x 的元素
    Node erase(int x) {
        Node ans = heap[x];
        heap[x] = heap[heap.size() - 1];
        heap.pop_back();
        // 删除任意位置，需要上浮下沉都要考虑
        heapifyDown(x);
        heapifyUp(x);
        return ans;
    }

private:
    void heapifyUp(int p) {
        while (p > 0) {
            int fa = (p - 1) / 2;
            if (heap[p].key < heap[fa].key) { // 小顶堆
                swap(heap[p], heap[fa]);
                p = fa;
            } else break;
        }
    }

    void heapifyDown(int p) {
        int child = 2 * p + 1;
        while (child < heap.size()) { // child 未出界说明 p 有孩子
            int otherChild = 2 * p + 2;
            // child 指向更小的孩子
            if (otherChild < heap.size() && heap[otherChild].key < heap[child].key) {
                child = otherChild;
            }
            // 如果不满足小根堆，则交换
            if (heap[p].key > heap[child].key) {
                swap(heap[p], heap[child]);
                p = child;
                child = 2 * p + 1;
            } else break;
        }
    }

    vector<Node> heap; // 数组实现二叉树
};
```

## 优先队列

二叉堆是优先队列(Priority Queue)一种简单、常见的实现，但不是最优实现。

理论上二叉堆可以支持 O(log N) 删除任意元素：

- 只需要定位该元素在堆中的结点 p（可以通过在数值与索引之间建立映射得到）
- 与堆尾交换，删除堆尾
- 从 p 向上、向下各进行一次调整

### C++ priority_queue

C++ 中的优先队列 priority_queue，默认是 less，大根堆。

如果要实现小根堆，需要重载 operator < 或者提供其他 compare，如 greater。

```cpp
bool operator< (const ListNode *node1, const ListNode *node2) {
    return node1->val > node2->val;
}

class Compare {
public:
    // node1 > node2, 则 node2 的优先级更高
    bool operator()(const ListNode *node1, const ListNode *node2) {
        return node1->val > node2->val;
    }
};

// 自定义 compare 需要把分配器 vector<ListNode *> 也写一下
priority_queue<ListNode *, vector<ListNode *>, Compare> q;
```
