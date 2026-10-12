# Dueplay 博客网站

个人技术博客，记录学习笔记和技术总结。

## 本地开发

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:4321/

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 网站结构

- **首页** (`/`) - 最新文章列表
- **往期整理** (`/archive/`) - 按分类浏览
  - 分类页 - 按技术类别查看文章
  - 时间线 - 按时间归档浏览
- **关于** (`/about/`) - 个人信息

## 添加新文章

在 `src/content/posts/` 目录下创建新的 `.md` 文件：

```markdown
---
title: 文章标题
date: 2024-01-01
description: 文章描述
categories: [Category]
---

文章内容...
```

## 技术栈

- Astro - 静态站点生成器
- Markdown - 内容格式
- CSS - 样式设计

## 已发布文章分类

- **Database** - 数据库相关（MySQL, Redis, 隔离级别等）
- **C++** - C++ 编程（智能指针, RAII 等）
- **System** - 系统编程（线程, 进程等）
- **Network** - 网络编程（Socket, IO 复用等）
- **DevOps** - 开发运维（Docker, Git, CMake）
- **Data Structure** - 数据结构与算法（排序, 哈希表等）
- **Distributed System** - 分布式系统（分布式事务等）

## 当前状态

- ✅ 18 篇技术笔记已发布
- ✅ 分类和归档功能完善
- ✅ 个人简介页面完成
- ✅ 开发服务器可用

---

Made with ❤️ by Dueplay
