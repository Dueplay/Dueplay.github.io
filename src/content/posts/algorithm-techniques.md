---
title: '前缀和、差分、双指针与单调栈队列'
date: 2024-03-18
categories: ['Algorithm']
description: '常用算法技巧：前缀和、差分、双指针、单调栈和单调队列的原理与应用'
---

## 一维前缀和

A：0~n-1，将 A 在最前面加一个 0，变为 A：0~n。

S：0~n，S[0]=0 代表前 0 项和

**S[i] = S[i-1] + A[i]**

通过前缀和，可以在 O(1) 时间内求出任意区间 [l, r] 的和：**sum[l, r] = S[r] - S[l-1]**

### 例题：优美子数组

[1248. 统计优美子数组](https://leetcode-cn.com/problems/count-number-of-nice-subarrays/)

```cpp
int numberOfSubarrays(vector<int>& nums, int k) {
    // 将 nums % 2 转化为只有 0,1 的数组，问题转化为子数组的和为 k
    // 求前缀和，问题转化为：l 到 r 的片段和为 s[r] - s[l-1] == k
    // 即 s[j] == s[i] - k，给定 i，有多少个 j 满足
    for (int i = 0; i < nums.size(); i++) {
        nums[i] = nums[i] % 2;
    }
    int pre = 0;
    unordered_map<int, int> count;
    count[pre] = 1;
    int ans = 0;
    for (int& n : nums) {
        pre += n;
        ans += count[pre - k];
        count[pre]++;
    }
    return ans;
}
```

## 二维前缀和

通过预处理求出 S，可在 O(1) 时间求出 sum(p, q, i, j)。

**S[i][j] = S[i-1][j] + S[i][j-1] - S[i-1][j-1] + matrix[i-1][j-1]**

**sum(row1, col1, row2, col2) = S[row2+1][col2+1] - S[row1][col2+1] - S[row2+1][col1] + S[row1][col1]**

### 例题：二维区域和检索

[304. 二维区域和检索 - 矩阵不可变](https://leetcode-cn.com/problems/range-sum-query-2d-immutable/)

```cpp
class NumMatrix {
public:
    vector<vector<int>> sum;
    
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size();
        if (m > 0) {
            int n = matrix[0].size();
            sum.resize(m + 1, vector<int>(n + 1, 0));
            for (int i = 1; i <= m; i++) {
                for (int j = 1; j <= n; j++) {
                    sum[i][j] = sum[i-1][j] + sum[i][j-1] - sum[i-1][j-1] + matrix[i-1][j-1];
                }
            }    
        }
    }
    
    int sumRegion(int row1, int col1, int row2, int col2) { // 参数从 0 开始
        return sum[row2+1][col2+1] - sum[row1][col2+1] - sum[row2+1][col1] + sum[row1][col1];
    }
};
```

## 差分

原数组 l~r 位置上每个数加 d，差分数组体现为在 l 位置 +d，r+1 位置 -d，再对差分求前缀和可得原数组。

### 例题：航班预订统计

[1109. 航班预订统计](https://leetcode-cn.com/problems/corporate-flight-bookings/)

```cpp
vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
    vector<int> delta(n + 2, 0); // 定义差分数组，初始为 0
    int l, r, d; // l~r 区间上的数加减 d，差分数组 l 位置 +d，r+1 位置 -d
    for (auto& booking : bookings) {
        l = booking[0];
        r = booking[1];
        d = booking[2];
        delta[l] += d;
        delta[r+1] -= d;
    }
    vector<int> sum(n + 1, 0); // 差分求前缀和为原数组
    for (int i = 1; i <= n; i++) {
        sum[i] = sum[i-1] + delta[i];
    }
    for (int i = 1; i <= n; i++) {
        sum[i-1] = sum[i];
    }
    sum.pop_back();
    return sum;
}
```

### 最大子数组和

[53. 最大子数组和](https://leetcode-cn.com/problems/maximum-subarray/)

**解法1**：前缀和+前缀最小值

**解法2**：贪心，只要和是正的，不断向右扩展，一旦发现和是负的，立即放弃。

```cpp
int maxSubArray(vector<int>& nums) {
    int n = nums.size();
    vector<int> sum(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        sum[i] = sum[i-1] + nums[i-1];
    }
    // 固定 i，s[i] - s[j] 最大，即求 s[j] min
    int ans = INT_MIN;
    int pre_min = sum[0];
    for (int i = 1; i <= n; i++) {
        ans = max(ans, sum[i] - pre_min);
        pre_min = min(pre_min, sum[i]);
    }
    return ans;
}
```

前缀和不止局限于求和，也可以拓展到前缀最大最小值。

## 双指针

双指针技巧通常用于在有序数组或需要两个指针协同工作的场景。

### 两数之和 II

[167. 两数之和 II - 输入有序数组](https://leetcode-cn.com/problems/two-sum-ii-input-array-is-sorted/)

```cpp
vector<int> twoSum(vector<int>& numbers, int target) {
    // i 增大的同时，要使等式成立，j 应该减小，第二重循环 j 增大就冗余了
    int j = numbers.size() - 1;
    for (int i = 0; i < j; i++) {
        while (i < j && numbers[i] + numbers[j] > target) j--;
        if (i < j && numbers[i] + numbers[j] == target)
            return {i + 1, j + 1};
    }
    return {};
}
```

### 三数之和

[15. 三数之和](https://leetcode-cn.com/problems/3sum/)

```cpp
vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> ans;
    for (int i = 0; i < nums.size(); i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue; // 去除重复
        auto all_two_sum = twoSum(nums, i + 1, -nums[i]);
        for (auto& jk : all_two_sum) {
            ans.push_back({nums[i], jk[0], jk[1]});
        }
    }
    return ans;
}

vector<vector<int>> twoSum(vector<int>& numbers, int start, int target) {
    vector<vector<int>> ans;
    int j = numbers.size() - 1;
    for (int i = start; i < j; i++) {
        if (i > start && numbers[i] == numbers[i-1]) continue; // 去除重复
        while (i < j && numbers[i] + numbers[j] > target) j--;
        if (i < j && numbers[i] + numbers[j] == target)
            ans.push_back({numbers[i], numbers[j]});
    }
    return ans;
}
```

### 盛最多水的容器

[11. 盛最多水的容器](https://leetcode-cn.com/problems/container-with-most-water/)

```cpp
int maxArea(vector<int>& height) {
    int ret = 0;
    int j = height.size() - 1, i = 0;
    while (i < j) {
        ret = max(ret, min(height[i], height[j]) * (j - i));
        // 以短的那根为高的面积已经是最大的了，所以移动短的那根
        // 找到高变大，宽变小的情况是否能有更大的
        if (height[i] > height[j]) j--;
        else i++;
    }
    return ret;
}
```

## 单调栈

单调栈用于维护一个单调递增或递减的栈，可以在 O(N) 时间内解决一些问题。

### 柱状图中最大的矩形

[84. 柱状图中最大的矩形](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

```cpp
int largestRectangleArea(vector<int>& heights) {
    // 一直移动，当前的高度比前面小，代表这个高度之前的最大面积就已经确定了
    heights.push_back(0); // 避免数组递增，不会进行计算的情况
    stack<Rect> s; // 记录递增的高度
    int ans = 0;
    for (int h : heights) {
        int accumulate_width = 0;
        while (!s.empty() && s.top().height >= h) {
            accumulate_width += s.top().width;
            ans = max(ans, accumulate_width * s.top().height);
            s.pop();
        }
        s.push({accumulate_width + 1, h});
    }
    return ans;
}

private:
    struct Rect {
        int width;
        int height;
    };
```

## 单调队列

单调队列用于维护滑动窗口的最值。

### 滑动窗口最大值

[239. 滑动窗口最大值](https://leetcode-cn.com/problems/sliding-window-maximum/)

```cpp
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> q; // 左右都要能出队，所以用 deque，存的是下标
    vector<int> ans;
    for (int i = 0; i < nums.size(); i++) {
        // 队头过期出队
        while (!q.empty() && q.front() <= i - k) q.pop_front();
        // 队尾不满足单调性，出队，新元素入队
        while (!q.empty() && nums[q.back()] <= nums[i]) q.pop_back();
        q.push_back(i);
        // 取队头为最佳选项
        if (i >= k - 1) ans.push_back(nums[q.front()]);
    }
    return ans;
}
```

也可以实现一个单调队列：

```cpp
class MyQueue { // 单调队列（从大到小）
public:
    deque<int> que;
    
    // 每次弹出的时候，比较当前要弹出的数值是否等于队列出口元素的数值
    void pop(int value) {
        if (!que.empty() && value == que.front()) {
            que.pop_front();
        }
    }
    
    // 如果 push 的数值大于入口元素的数值，那么就将队列后端的数值弹出
    // 直到 push 的数值小于等于队列入口元素的数值为止
    void push(int value) {
        while (!que.empty() && value > que.back()) {
            que.pop_back();
        }
        que.push_back(value);
    }
    
    // 查询当前队列里的最大值
    int front() {
        return que.front();
    }
};
```

### 接雨水

[42. 接雨水](https://leetcode-cn.com/problems/trapping-rain-water/)

**解法1**：单调栈

```cpp
int trap(vector<int>& height) {
    // 维护一个单调递减的栈，当前元素比栈顶高
    // 则可以以栈顶元素的高作为矩形的底边
    stack<Rect> s;
    int ans = 0;
    s.push({0, 0});
    for (int h : height) {
        int w = 0;
        while (s.size() > 1 && h >= s.top().height) {
            w += s.top().width;
            int bottom = s.top().height;
            s.pop();
            ans += w * max(0, min(s.top().height, h) - bottom);
        }
        s.push({h, w + 1});
    }
    return ans;
}

private:
    struct Rect {
        int height;
        int width;
    };
```

**解法2**：前缀和后缀最大值

维护每个柱体左边的最大值，和右边的最大值，遍历每个柱体，它两边的最大值都比它大，则可以这个柱体为底接到水，接水高度为两边最大值的 min - 柱体高度。

```cpp
int trap(vector<int>& height) {
    int n = height.size();
    vector<int> left(n), right(n);
    // 求每个柱体左右边的最大值
    for (int i = 1; i < n; i++) {
        left[i] = max(left[i-1], height[i-1]);
    }
    for (int i = n - 2; i >= 0; i--) {
        right[i] = max(right[i+1], height[i+1]);
    }
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int bottom_h = min(left[i], right[i]) - height[i];
        ans += max(0, bottom_h);
    }
    return ans;
}
```
