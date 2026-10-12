---
title: '图论算法详解'
pubDate: 2024-03-25
categories: ['Data Structure']
description: '图的基本概念、最短路径算法和最小生成树算法'
---

## 图的基础

图可以表示为一个点集和一个边集：Graph(V, E)

- V-vertex: 点
- E-Edge：边

**点的度数（degree）**：入度和出度——一个点相连的入边和出边

**图的分类**：有向图和无向图，边的权值

**图的存储**：邻接矩阵、邻接表、出边数组

### 图的 DFS

可用于判断是否有环、连通等问题。

```cpp
void dfs() {
    // 1. 标记访问
    // 2. 遍历出边，递归
}
```

### 图的 BFS

求解单源最短路径。

```cpp
void bfs() {
    // 1. 入队时标记访问
    // 2. 队列不空，队头出队，出边入队
}
```

## 最短路径

### 单源最短路径问题

- 给定一张有向图 G=(V,E)，V 是点集，E 是边集，|V|=n，|E|=m
- 节点以 [1,n] 之间的连续整数编号
- (x,y,z) 描述一条从 x 出发，到达 y，长度为 z 的有向边
- 设 1 号点为起点

求长度为 n 的数组 dist，其中 dist[i] 表示从起点 1 到节点 i 的最短路径的长度。

## Bellman-Ford 算法

Bellman-Ford 算法是基于**动态规划和迭代思想**的。

1. 扫描所有的边 (x, y, z)，若 dist[x] + z < dist[y]，则用 dist[x] + z 更新 dist[y]
2. 重复上述步骤，直到没有更新操作发生

若原问题有解（图中没有负环，权值和为负数的环），扫描所有边更新的过程最多执行 **n-1 轮**。

因为：一条路径至多包含 n-1 条边。

**时间复杂度 O(NM)**，最好一轮结束，最坏 n-1 轮。

当所有点与起点都是直接相连时，一轮结束。n-1 轮就是一条链的情形。

```cpp
vector<int> dist(n + 1, 1e9);
dist[k] = 0;
for (int i = 1; i < n; i++) {
    bool update = false;
    for (auto& e : edges) {
        int x = e[0];
        int y = e[1];
        int z = e[2];
        if (dist[x] + z < dist[y]) {
            update = true;
            dist[y] = dist[x] + z;
        }
    }
    // 遍历完所有的边都没有更新了
    if (!update) break;
}
```

## Dijkstra 算法

Dijkstra 算法是基于**贪心思想**的，只适用于**所有边的长度都是非负数**的图。

1. 初始化起点 dist[1] = 0，其余节点的 dist 为 +∞
2. 找出一个未被标记的，dist[x] 最小的节点，然后标记节点 x
3. 扫描节点 x 的所有出边 (x, y, z)，若 dist[x] + z < dist[y]，则用 dist[x] + z 更新 dist[y]
4. 重复上述 2-3，直到所有的节点都被标记

**贪心**：在非负权图上，全局最小的 dist 值不可能再被其他节点更新，因此可以不断取 dist 最小的点（每个点只被选一次），更新其他节点。

用二叉堆维护最小 dist 值可以做到 **O(m log n)** 的时间复杂度。

```cpp
vector<int> dist(n + 1, 1e9);
vector<bool> visited(n + 1, false);
dist[k] = 0;
vector<vector<int>> edges(n + 1, vector<int>()); // 出边数组，出边对应的权值
vector<vector<int>> vertex(n + 1, vector<int>()); // 出边数组，出边

for (auto& e : times) {
    int x = e[0];
    int y = e[1];
    int z = e[2];
    vertex[x].push_back(y);
    edges[x].push_back(z);
}

// dijkstra, 每次在已求出的 dist 中选出最小的进行扩展
// priority_queue 默认是大根堆，使用 greater 为小根堆
// 或者 push({-dist[k], k})
priority_queue<pair<int, int>> q; // pair：距离，节点
q.push({-dist[k], k});

while (!q.empty()) {
    auto [d, x] = q.top();
    q.pop();
    // 每个点只拓展一次
    if (visited[x]) continue;
    visited[x] = true;
    for (int i = 0; i < vertex[x].size(); i++) {
        int y = vertex[x][i];
        int z = edges[x][i];
        if (dist[x] + z < dist[y]) {
            dist[y] = dist[x] + z;
            q.push({-dist[y], y});
        }
    }
}
```

## Floyd 算法

Floyd 算法可以在 **O(n³)** 的时间内求出图中每一对点之间的最短路径。基于**动态规划**。

dp[k, i, j] 表示经过编号不超过 k 的点为中继，从 i 到 j 的最短路。

**决策**：是否使用 k 这个中继点

```cpp
dp[k, i, j] = min(dp[k - 1, i, j], dp[k - 1, i, k] + dp[k - 1, k, j]);
```

可以省掉第一维：

```cpp
dp[i, j] = min(dp[i, j], dp[i, k] + dp[k, j]);
```

**初始状态**：d 为邻接矩阵

### 与 Bellman-Ford、Dijkstra 的比较

- O(n³) vs O(n²\*m) vs O(n\*m\*log n)
- O(n²\*m) 最坏 m 为 n²，O(n⁴)
- O(n\*m\*log n) 最坏 m 为 n²，O(n³ \* log n)

### 代码实现

```cpp
vector<vector<int>> f(n, vector<int>(n, 1e9));
for (int i = 0; i < n; i++) f[i][i] = 0;
for (auto& e : edges) {
    int x = e[0];
    int y = e[1];
    int z = e[2];
    // 无向图
    f[x][y] = z;
    f[y][x] = z;
}
for (int k = 0; k < n; k++) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            f[i][j] = min(f[i][j], f[i][k] + f[k][j]);
        }
    }
}
```

## 最小生成树

给定一张边带权的无向图 G=(V,E)，n=|V|，m=|E|。

由 V 中全部 n 个顶点和 E 中 n-1 条边构成的无向连通子图被称为 G 的一棵生成树。

边的权值之和最小的生成树被称为无向图 G 的**最小生成树(Minimum Spanning Tree, MST)**。

### 性质

任意一棵最小生成树**一定包含无向图中权值最小的边**。

**推论**：把任何一个生成森林扩展为生成树，一定使用了图中剩余边中权值最小的。

**证明方法**：树上加一条边形成环+反证法，如果没有使用权值最小这条边，那么把它加进未使用这条边的生成树，加入后 n 个 n 条边，肯定有环，去掉一条边肯定也还是生成树，去除一条边后生成树权值变小，与之前矛盾。

## Kruskal 算法

Kruskal 算法使用并查集维护无向图的最小生成森林。

1. 建立并查集，每个点各自构成一个集合
2. 把所有边按照权值从小到大排序，依次扫描每条边 (x,y,z)
3. 若 x,y 属于同一集合（连通），则忽略这条边，继续扫描下一条
4. 否则，合并 x,y 所在的集合，并把 z 累加到答案中
5. 所有边扫描完成后，第 4 步中处理过的边就构成最小生成树

**时间复杂度为 O(m log m)**

### 代码实现

```cpp
int minCost(vector<vector<int>>& points) {
    int n = points.size();
    // 构建边
    vector<vector<int>> edges; // {x, y, z} : x -> y 距离为 z
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            edges.push_back({i, j, abs(points[i][0] - points[j][0]) + 
                             abs(points[i][1] - points[j][1])});
        }
    }
    
    // 对边进行排序，每次选最小的边判断是否已经联通
    sort(edges.begin(), edges.end(), [](const vector<int>& a, const vector<int>& b) {
        return a[2] < b[2];
    });
    
    // Kruskal 算法
    fa = vector<int>(n);
    int ans = 0;
    for (int i = 0; i < n; i++) fa[i] = i;
    for (int i = 0; i < edges.size(); i++) {
        int x = edges[i][0];
        int y = edges[i][1];
        int z = edges[i][2];
        if (find(x) != find(y)) {
            // 这条边的两端还未联通
            unionSet(x, y);
            ans += z;
        }
    }
    return ans;
}

// 并查集来判断选择的边对应的两点是否已经联通
vector<int> fa;

int find(int x) {
    if (fa[x] == x) return x;
    return fa[x] = find(fa[x]);
}

void unionSet(int x, int y) {
    x = find(x);
    y = find(y);
    if (x != y) {
        fa[x] = y;
    }
}
```

### 相关题目

- [743. 网络延迟时间](https://leetcode.cn/problems/network-delay-time/)
- [1334. 阈值距离内邻居最少的城市](https://leetcode.cn/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/)
- [1584. 连接所有点的最小费用](https://leetcode.cn/problems/min-cost-to-connect-all-points/)
