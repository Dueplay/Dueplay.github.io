---
title: '链表常见题型与技巧'
pubDate: 2024-03-10
categories: ['Data Structure']
description: '链表的基本操作和常见面试题解法，包括反转、环形检测、归并等'
---

## 链表基本操作

### 单链表

**插入**：node 为要插入位置前的节点

```cpp
newNode->next = node->next;
node->next = newNode;
```

**删除**：node 为要删除节点前的节点，即 node->next = deleteNode;

```cpp
node->next = node->next->next;
```

### 双链表

**插入**：node 为要插入位置前的节点

```cpp
newNode->next = node->next;
newNode->pre = node;
newNode->next->pre = newNode;
newNode->pre->next = newNode;
```

**删除**：node 为要删除节点前的节点，即 node->next = deleteNode;

```cpp
node->next = node->next->next;
node->next->pre = node;
```

### 单向循环链表

```cpp
head->next = head;
// 尾插法插入，tail = head;
newNode->next = tail->next;
tail->next = newNode;
tail = newNode;
```

### 双向循环链表

```cpp
head->next = head;
head->pre = head;
// 尾插法插入，tail = head;
newNode->next = tail->next;
newNode->pre = tail;
tail->next->pre = newNode;
tail->next = newNode;
tail = newNode;
```

### 操作模板

```cpp
// 双链表，在 p 后面新建节点的操作模板
Node* AddNode(Node* p, int idx) {
    Node* q = new Node();
    q->pre = p, q->next = p->next;
    p->next->pre = q, p->next = q;
    return q;
}

// 双链表，删除节点 p 的操作模板
void DeleteNode(Node* p) {
    p->pre->next = p->next;
    p->next->pre = p->pre;
    delete p;
}
```

## 常见题型

### 1. 反转链表

**法一**：原链表节点依次取下来然后头插法插入新链表。

**法二**：更改每个节点的 next 指针，第一个节点的 next 修改为 nullptr（没有保护节点的情况），第二个节点的 next 修改为指向前一个节点。

```cpp
ListNode* reverseList(ListNode* head) {
    // 更改 next 指针指向前一个节点
    ListNode *last = nullptr;
    while (head) {
        ListNode *head_next = head->next;
        head->next = last; // 修改 next 指向前一个
        last = head;
        head = head_next;
    }
    return last;
}
```

### 2. K 个一组翻转链表

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode *dummy = new ListNode(0, head);
        ListNode *last = dummy, *nextGroup = nullptr, *end = nullptr;
        while (head != nullptr) {
            end = getEnd(head, k);
            if (end == nullptr) break;
            nextGroup = end->next;
            // 翻转 [head->end] 为 [head<-end]
            reverse(head, end);
            // 连接上一组和下一组
            last->next = end;
            head->next = nextGroup;
            // 迭代下一组
            last = head;
            head = nextGroup;
        }
        return dummy->next;
    }
    
    ListNode* getEnd(ListNode *head, int k) {
        if (head == nullptr) return nullptr;
        for (int i = 0; i < k - 1; i++) {
            head = head->next;
            if (head == nullptr) break;
        }
        return head;
    }
    
    // 翻转 [head, end] 之间的链表
    void reverse(ListNode *head, ListNode *end) {
        if (head == end) return;
        ListNode* last = head;
        head = head->next;
        while (head != end) {
            ListNode* headNext = head->next;
            head->next = last;
            last = head;
            head = headNext;
        }
        end->next = last;
    }
};
```

### 3. 环形链表

**快慢指针法**，fast 一次走两步，slow 一次走一步。O(length) 时间，O(1) 空间。

有环必定发生套圈（快慢指针相遇），无环不会发生套圈（快指针到达 null）。

快慢指针还可以用来找链表的中间节点，当 fast 为 null 时，slow 指向中间节点。

```cpp
bool hasCycle(ListNode *head) {
    ListNode *fast = head, *slow = head;
    while (fast != nullptr && fast->next != nullptr) {
        fast = fast->next->next;
        slow = slow->next;
        if (fast == slow) {
            return true;
        }
    }
    return false;
}
```

### 4. 找到环开始位置

定义快慢指针，两者在 st 相遇时：r 为环的长度

- slow 指针所走：l + p
- fast 指针所走：l + p + k * r，k >= 1

速度两倍关系：2(l + p) = l + p + k * r

得到 l = k * r - p = (k-1)r + (r - p)

**含义**：从 head 走到 st，等于从 meet 走到 st，然后再绕几圈。

此时开始让慢指针与 head 同时移动，必定在环的起始点相遇。

```cpp
ListNode *detectCycle(ListNode *head) {
    ListNode* fast = head;
    ListNode* slow = head;
    while (fast != nullptr && fast->next != nullptr) {
        fast = fast->next->next;
        slow = slow->next;
        // 相遇
        if (fast == slow) {
            while (head != slow) {
                head = head->next;
                slow = slow->next;
            }
            return head;
        }
    }
    return nullptr;
}
```

### 5. 双指针 first 和 second

first = second + k，当 first 到达 null，second 指向倒数第 k 个节点。

要删除倒数的第 k 个节点，可以添加一个保护头节点，然后 first = second + k + 1，first 为 null 时，second 指向要删除节点的前一个节点。

### 6. 两个有序链表归并

```cpp
ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    if (list1 == nullptr) return list2;
    if (list2 == nullptr) return list1;
    ListNode *head = new ListNode();
    ListNode *tail = head;
    while (list1 && list2) {
        if (list1->val < list2->val) {
            tail->next = list1;
            list1 = list1->next;
        } else {
            tail->next = list2;
            list2 = list2->next;
        }
        tail = tail->next;
    }
    if (list1) 
        tail->next = list1;
    if (list2) 
        tail->next = list2;
    return head->next;
}

// 递归写法
ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    if (list1 == nullptr) return list2;
    if (list2 == nullptr) return list1;
    if (list1->val < list2->val) {
        list1->next = mergeTwoLists(list1->next, list2);
        return list1;
    } else {
        list2->next = mergeTwoLists(list2->next, list1);
        return list2;
    }
}
```

### 合并多个有序链表

**法1**：两两合并为一个新的，然后再与剩下的合并。

**法2**：优先队列让 val 小的元素处于队头，维护当前每个链表没有被合并的元素的最前面一个，k 个链表就最多有 k 个满足这样条件的元素，每次在这些元素里面选取 val 属性最小的元素合并到答案中。

```cpp
class Compare {
public:
    // node1 > node2，则 node2 的优先级更高
    bool operator()(const ListNode *node1, const ListNode *node2) {
        return node1->val > node2->val;
    }
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // 维护一个优先队列，最小元素具有最高优先级，位于队头
        priority_queue<ListNode *, vector<ListNode *>, Compare> q;
        for (ListNode *list : lists) {
            if (list != nullptr) { // 队头入队
                q.push(list);
            }
        }
        ListNode *dummyHead = new ListNode();
        ListNode *tail = dummyHead;
        while (!q.empty()) {
            ListNode *minNode = q.top();
            q.pop();
            tail->next = minNode;
            tail = minNode;
            if (minNode->next != nullptr) {
                // 最小节点所在链表的下一个节点入队
                q.push(minNode->next);
            }
        }
        return dummyHead->next;
    }
};
```

### 7. 单个链表的排序

**插入排序**，O(n²)

```cpp
ListNode* sortList(ListNode* head) {
    // 插入排序
    if (head == nullptr) return nullptr;
    ListNode *pre = nullptr;
    ListNode *dummy = new ListNode(0, head);
    head = head->next;
    dummy->next->next = nullptr;
    while (head != nullptr) {
        ListNode *tem = head;
        head = head->next;
        pre = dummy;
        // 找到要插入位置
        while (pre->next != nullptr) {
            if (pre->next->val < tem->val) {
                pre = pre->next;
            } else
                break;
        }
        tem->next = pre->next;
        pre->next = tem;
    }
    pre = dummy->next;
    delete dummy;
    return pre;
}
```

**归并排序**

从链表中间分为左右两个链表，分别对左右链表进行排序（递归），再合并左右链表。

```cpp
ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head; // 基本情况
    ListNode *mid = split(head);
    ListNode *left = sortList(head);
    ListNode *right = sortList(mid);
    return merge(left, right);
}

// 合并两个有序链表的函数
ListNode* merge(ListNode* l1, ListNode* l2) {
    ListNode* dummyHead = new ListNode();
    ListNode *cur = dummyHead;
    while (l1 && l2) {
        if (l1->val < l2->val) {
            cur->next = l1;
            l1 = l1->next;
        } else {
            cur->next = l2;
            l2 = l2->next;
        }
        cur = cur->next;
    }
    cur->next = (l1 != nullptr) ? l1 : l2;
    cur = dummyHead->next;
    delete dummyHead;
    return cur;
}

// 找到链表中点并断开的函数，返回后一半链表的开头
ListNode* split(ListNode* head) {
    ListNode *fast = head, *slow = head, *prev = nullptr;
    while (fast && fast->next) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }
    if (prev) prev->next = nullptr; // 从 slow 处断开
    return slow;
}
```

### 8. 双链表实现 LRU

可以 O(1) 的平均时间复杂度删除和查询节点。

```cpp
class LRUCache {
public:
    LRUCache(int capacity) : capacity_(capacity) {
        // 两个保护节点
        head = new Node();
        tail = new Node();
        head->next = tail;
        tail->prev = head;
    }
    
    int get(int key) {
        if (nodes.find(key) == nodes.end()) return -1;
        Node *node = nodes[key];
        // 访问后节点放在链表末尾
        remove(node);
        insert(node);
        return node->val;
    }
    
    void put(int key, int value) {
        // key 已经存在
        if (nodes.find(key) != nodes.end()) {
            nodes[key]->val = value;
            remove(nodes[key]);
            insert(nodes[key]);
            return;
        } else {
            Node *node = new Node(key, value);
            insert(node);
            nodes.insert({key, node});
        }
        if (nodes.size() > capacity_) {
            Node *node = head->next;
            remove(node);
            auto it = nodes.find(node->key);
            nodes.erase(it);
            delete node;
        }
    }

private:
    class Node {
    public:
        Node() = default;
        Node(int key, int value) : key(key), val(value), next(nullptr), prev(nullptr) {}
        int key, val;
        Node *next, *prev;
    };
    
    void remove(Node *node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }
    
    void insert(Node *node) {
        tail->prev->next = node;
        node->prev = tail->prev;
        node->next = tail;
        tail->prev = node;
    }
    
    int capacity_;
    unordered_map<int, Node *> nodes;
    Node *head = nullptr, *tail = nullptr;
};
```

### 9. 删除链表中的重复元素

```cpp
// 删除链表中的重复元素
void deleteDuplicates(ListNode* head) {
    if (!head) return;

    std::unordered_set<int> seen;  // 存储已经遇到的元素
    ListNode* current = head;
    ListNode* prev = nullptr;

    while (current) {
        if (seen.find(current->val) != seen.end()) {
            // 如果当前节点的值已经存在于 set 中，删除当前节点
            prev->next = current->next;
            delete current;
            current = prev->next;
        } else {
            // 如果当前节点的值没有存在于 set 中，加入 set 并继续遍历
            seen.insert(current->val);
            prev = current;
            current = current->next;
        }
    }
}

// 删除链表中相邻的重复元素
ListNode* delete_duplicates_adjacent(ListNode* head) {
    ListNode* current = head;
    while (current && current->next) {
        if (current->val == current->next->val) {
            ListNode* temp = current->next;
            current->next = current->next->next;
            delete temp;  // 释放内存
        } else {
            current = current->next;
        }
    }
    return head;
}
```
