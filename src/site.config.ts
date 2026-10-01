// 站点配置：改这里即可定制标题、导航、评论等
export const SITE = {
  title: 'Dueplay',
  description: 'Dueplay 的个人博客，记录编程、数据库与分布式系统的学习与思考。',
  author: 'Dueplay',
  url: 'https://dueplay.github.io',
  lang: 'zh-CN',
  // 顶部横幅的默认标语，文章可通过 frontmatter 的 slogan 字段覆盖
  slogan: 'Stay hungry, stay foolish.',
  github: 'https://github.com/Dueplay',
  email: '',
  pageSize: 10,
  // 文章末尾的支持按钮，url 为空则不显示
  sponsor: { text: '❤️ 支持作者', url: '' },
  // giscus 评论（存放在仓库的 GitHub Discussions 中），categoryId 为空时不显示评论区
  giscus: {
    repo: 'Dueplay/Dueplay.github.io',
    repoId: 'R_kgDOLigysA',
    category: 'General',
    categoryId: 'DIC_kwDOLigysM4DG0yM',
  },
};
