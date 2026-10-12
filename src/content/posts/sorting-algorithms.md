---
title: 排序算法总结
date: 2023-11-18
description: 常见排序算法详解，包括基于比较的排序（选择、插入、冒泡、堆排序、归并排序、快速排序）和非比较排序（计数排序、基数排序）。
categories: [Data Structure]
---

排序算法是算法学习的基础，也是面试中的高频考点。本文总结常见的排序算法及其特点。

## 排序算法分类

### 基于比较的排序

通过比较大小来决定元素间的相对次序。

可以证明时间复杂度下界为 **O(N log N)** —— 不可能突破这个复杂度达到更快。

### 非比较类排序

不通过比较大小来决定元素间的相对次序，可以突破 O(N log N) 的时间复杂度下界。

## 基于比较的排序

### 初级排序算法

时间复杂度均为 **O(N²)**。

#### 1. 选择排序

每次从未排序数据中找到最小（大）值，放到已排序序列末尾。

```cpp
void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}
```

#### 2. 插入排序

从前到后依次考虑每个未排序数据，在已排序序列中找到合适位置插入。

```cpp
void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
```

#### 3. 冒泡排序

不断循环扫描，每次查看相邻的元素，如果逆序，则交换。

```cpp
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // 优化：如果一轮没有交换，说明已经有序
    }
}
```

### 堆排序

堆排序（Heap Sort）是对选择排序的优化，利用二叉堆高效地选出最小值。

**时间复杂度**：O(N log N)

**算法步骤**：
1. 建立一个包含所有 N 个元素的二叉堆
2. 重复 N 次从堆中取出最小值，即可得到有序序列

```cpp
void heapSort(vector<int>& arr) {
    int n = arr.size();
    priority_queue<int, vector<int>, greater<int>> minHeap;  // 小根堆
    
    // 建堆
    for (int i = 0; i < n; i++) {
        minHeap.push(arr[i]);
    }
    
    // 取出元素
    for (int i = 0; i < n; i++) {
        arr[i] = minHeap.top();
        minHeap.pop();
    }
}
```

### 归并排序

归并排序（Merge Sort）是一个基于分治的算法。

**时间复杂度**：O(N log N)

**算法思想**：
- 原问题：把数组排序
- 子问题：把数组前一半、后一半分别排序
- 然后再合并左右两半（两个有序数组）

```cpp
void merge(vector<int>& nums, int l, int mid, int r) {
    int i = l, j = mid + 1;
    vector<int> temp(r - l + 1);
    
    for (int k = 0; k < temp.size(); k++) {
        if (j > r || (i <= mid && nums[i] <= nums[j])) {
            temp[k] = nums[i++];
        } else {
            temp[k] = nums[j++];
        }
    }
    
    for (int k = 0; k < temp.size(); k++) {
        nums[l + k] = temp[k];
    }
}

void mergeSort(vector<int>& nums, int l, int r) {
    if (l >= r) return;
    
    int mid = (l + r) >> 1;
    mergeSort(nums, l, mid);
    mergeSort(nums, mid + 1, r);
    merge(nums, l, mid, r);
}
```

### 快速排序

快速排序（Quick Sort）也是一个基于分治的算法。

**期望时间复杂度**：O(N log N)  
**最坏时间复杂度**：O(N²)

**算法步骤**：
1. 从数组中选取中轴元素 pivot
2. 将小元素放在 pivot 左边，大元素放在右边
3. 然后分别对左边和右边的子数组进行快排

**快速排序和归并排序的区别**：

- **归并排序**：先排左右子数组（左右内部有序），然后合并两个有序数组
- **快速排序**：先调配出左右子数组（内部无序），然后对左右子数组分别进行排序

**性能分析**：

- 随机选取 pivot，期望时间复杂度 O(N log N)
- 如果每次选择的 pivot 都不好，每次 pivot 将数组分为一边 1 个和一边 N-1 个数，会退化为 O(N²)

```cpp
int partition(vector<int>& nums, int l, int r) {
    int pivot = l + rand() % (r - l + 1);
    int pivotVal = nums[pivot];
    
    while (l <= r) {
        while (nums[r] > pivotVal) r--;
        while (nums[l] < pivotVal) l++;
        if (l <= r) {
            swap(nums[l], nums[r]);
            l++;
            r--;
        }
    }
    return r;
}

void quickSort(vector<int>& nums, int l, int r) {
    if (l >= r) return;
    
    int pivot = partition(nums, l, r);
    quickSort(nums, l, pivot);
    quickSort(nums, pivot + 1, r);
}
```

## 非比较类排序

### 计数排序（Counting Sort）

计数排序要求输入的数据必须是**有确定范围**的整数。

**算法步骤**：
1. 将输入的数据作为 key 存储在额外的 cnt 数组中
2. 然后依次把计数大于 1 的填充回原数组

**时间复杂度**：O(N + M)，N 为元素个数，M 为数值范围

```cpp
void countingSort(vector<int>& arr) {
    if (arr.empty()) return;
    
    int maxVal = *max_element(arr.begin(), arr.end());
    int minVal = *min_element(arr.begin(), arr.end());
    int range = maxVal - minVal + 1;
    
    vector<int> count(range, 0);
    
    // 统计每个元素出现的次数
    for (int num : arr) {
        count[num - minVal]++;
    }
    
    // 填充回原数组
    int idx = 0;
    for (int i = 0; i < range; i++) {
        while (count[i]-- > 0) {
            arr[idx++] = i + minVal;
        }
    }
}
```

### 基数排序（Radix Sort）

基数排序把数据切割成一位位数字（0-9），从低位到高位对每位分别进行计数排序。

**时间复杂度**：O(N * K)，K 为数字位数

```cpp
void radixSort(vector<int>& arr) {
    if (arr.empty()) return;
    
    int maxVal = *max_element(arr.begin(), arr.end());
    
    // 从个位开始，对每一位进行计数排序
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        vector<int> output(arr.size());
        vector<int> count(10, 0);
        
        // 统计每个桶中的元素个数
        for (int num : arr) {
            count[(num / exp) % 10]++;
        }
        
        // 计算累计次数
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        // 从后向前遍历，保证稳定性
        for (int i = arr.size() - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }
        
        arr = output;
    }
}
```

## 排序算法的稳定性

对于序列中存在的若干个大小相等的元素（重复元素）：

- 如果排序前后它们的相对次序一定保持不变，就称排序算法是**稳定的**
- 否则就称排序算法是**不稳定的**

### 稳定的排序算法

- 插入排序
- 冒泡排序
- 归并排序
- 计数排序
- 基数排序
- 桶排序

### 不稳定的排序算法

- 选择排序
- 希尔排序
- 快速排序
- 堆排序

## 排序算法对比

| 排序算法 | 平均时间复杂度 | 最坏时间复杂度 | 空间复杂度 | 稳定性 |
|---------|--------------|--------------|-----------|--------|
| 冒泡排序 | O(N²) | O(N²) | O(1) | 稳定 |
| 选择排序 | O(N²) | O(N²) | O(1) | 不稳定 |
| 插入排序 | O(N²) | O(N²) | O(1) | 稳定 |
| 希尔排序 | O(N log N) | O(N²) | O(1) | 不稳定 |
| 归并排序 | O(N log N) | O(N log N) | O(N) | 稳定 |
| 快速排序 | O(N log N) | O(N²) | O(log N) | 不稳定 |
| 堆排序 | O(N log N) | O(N log N) | O(1) | 不稳定 |
| 计数排序 | O(N + M) | O(N + M) | O(M) | 稳定 |
| 基数排序 | O(N * K) | O(N * K) | O(N + K) | 稳定 |
| 桶排序 | O(N + M) | O(N²) | O(N + M) | 稳定 |

## 排序算法的选择

### 小规模数据（N < 50）

- **插入排序**：实现简单，常数项小

### 中等规模数据（50 < N < 10000）

- **快速排序**：平均性能最好
- **归并排序**：需要稳定排序时使用

### 大规模数据（N > 10000）

- **快速排序**：平均性能最好
- **堆排序**：空间复杂度要求严格时使用

### 特殊场景

- **数据范围小**：计数排序
- **数据位数固定**：基数排序
- **部分有序**：插入排序
- **需要稳定排序**：归并排序

## C++ STL 中的排序

### std::sort

```cpp
#include <algorithm>

vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};

// 默认升序
sort(arr.begin(), arr.end());

// 自定义比较函数
sort(arr.begin(), arr.end(), [](int a, int b) {
    return a > b;  // 降序
});
```

**特点**：
- 内部实现：快速排序 + 插入排序 + 堆排序（introsort）
- 时间复杂度：O(N log N)
- 不稳定

### std::stable_sort

```cpp
#include <algorithm>

vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};

// 稳定排序
stable_sort(arr.begin(), arr.end());
```

**特点**：
- 内部实现：归并排序
- 时间复杂度：O(N log N)
- 稳定

### std::partial_sort

```cpp
#include <algorithm>

vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};

// 对前 3 个元素排序
partial_sort(arr.begin(), arr.begin() + 3, arr.end());
```

**特点**：
- 内部实现：堆排序
- 时间复杂度：O(N log K)，K 为需要排序的元素个数

## 总结

排序算法是算法学习的基础：

- **理解各种排序算法的原理和特点**
- **掌握时间复杂度和空间复杂度的分析**
- **了解稳定性的重要性**
- **根据实际场景选择合适的排序算法**

在工程实践中，通常直接使用 STL 提供的排序函数，但了解排序算法的原理对于算法面试和性能优化都非常重要。
