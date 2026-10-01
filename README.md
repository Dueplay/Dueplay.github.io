# Dueplay.github.io

个人博客，基于 [Astro](https://astro.build) 构建。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
```

## 写文章

在 `src/content/posts/` 新建 Markdown 文件，文件名即文章链接 `/posts/<文件名>/`：

```yaml
---
title: 文章标题
date: 2026-10-02
description: 摘要（可选，不填则截取正文）
categories: [Database]
slogan: 顶部横幅标语（可选）
draft: false
---
```

图片放在 `public/images/`，正文里用 `/images/xxx.png` 引用。

## 配置

站点标题、标语、GitHub 链接、评论等都在 `src/site.config.ts`。

- **评论**：基于 giscus，评论存放在本仓库的 GitHub Discussions，样式在 `public/css/comment.css`。
- **支持按钮**：填写 `sponsor.url` 后文章末尾会出现按钮。

## 部署

推送到 `master` 后，GitHub Actions（`.github/workflows/deploy.yml`）会构建并发布到 `gh-pages` 分支，GitHub Pages 从该分支提供服务。

## 功能

- 首页文章列表与分页，横幅标语打字动画与鼠标光点特效
- 文章页：分类与日期、悬停显示页面二维码、宽屏右侧吸顶目录（滚动高亮）、代码高亮与一键复制、图片点击放大、giscus 评论、Read More 推荐
- 全站搜索（按 `/` 打开，方向键选择，回车跳转）
- 向下滚动自动隐藏导航、RSS（`/feed.xml`）
