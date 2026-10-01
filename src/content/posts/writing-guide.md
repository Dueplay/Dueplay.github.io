---
title: 写作指南：这个博客支持哪些排版
date: 2026-10-02
description: 一篇用来检验排版的示例文章，覆盖标题目录、代码高亮、图片放大、表格、引用等文章详情页的全部能力，也是以后写文章时的速查手册。
categories: [Guide]
---

这篇文章既是排版测试，也是写作速查。新建文章只需要在 `src/content/posts/` 下放一个 Markdown 文件，文件名就是文章链接里的 slug。

## Frontmatter 字段

每篇文章开头都需要一段 frontmatter：

```yaml
---
title: 文章标题
date: 2026-10-02
description: 首页列表和搜索里显示的摘要，不填则截取正文
categories: [Database]
slogan: 顶部横幅显示的句子，不填用站点默认
draft: false
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，决定排序 |
| `description` | 否 | 摘要 |
| `categories` | 否 | 分类，显示在标题下方 |
| `slogan` | 否 | 横幅标语 |
| `draft` | 否 | 为 `true` 时只在本地预览可见 |

## 文章目录

当文章里的二级、三级标题不少于 5 个时，宽屏下右侧会出现吸顶目录，滚动时自动高亮当前章节；超过 14 个时只显示二级标题。

### 标题层级

正文请从二级标题 `##` 开始，一级标题留给文章标题。

### 锚点链接

每个标题都会自动生成锚点，可以直接复制链接分享到某一节。

## 代码高亮

代码块会带上 macOS 风格的窗口头部、语言标签和复制按钮：

```cpp
#include <iostream>
#include <memory>

struct Page {
  int id;
  explicit Page(int id) : id(id) {}
};

int main() {
  auto page = std::make_unique<Page>(42);
  std::cout << "page id = " << page->id << std::endl;  // 输出 42
  return 0;
}
```

```bash
npm install
npm run dev
```

行内代码会是这样：`std::shared_ptr<T>`。

## 图片

点击图片可以全屏放大查看，图片的 alt 文字会作为放大后的说明：

![Astro 构建流程示意图](/images/sample.svg)

## 引用与列表

> 凡是过往，皆为序章。
> —— 莎士比亚《暴风雨》

- 无序列表第一项
- 无序列表第二项，包含 [一个链接](https://github.com/Dueplay)

1. 有序列表
2. 第二项

## 其它

页面信息栏中日期右侧的小图标，鼠标悬停时会显示当前页面的二维码，方便手机扫码继续阅读。文章底部的 Read More 会推荐上一篇文章。
