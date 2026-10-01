// 把 Shiki 生成的 <pre> 包进带 macOS 圆点、语言标签和复制按钮的代码块容器
const el = (tagName, className, children = [], extra = {}) => ({
  type: 'element',
  tagName,
  properties: { className: [className], ...extra },
  children,
});
const text = (value) => ({ type: 'text', value });

function wrap(pre) {
  const lang = pre.properties?.dataLanguage;
  const label = lang && lang !== 'plaintext' && lang !== 'text' ? String(lang).toUpperCase() : '';
  const header = el('div', 'highlight-header', [
    el('div', 'highlight-dots', [el('span', 'dot-red'), el('span', 'dot-yellow'), el('span', 'dot-green')]),
    ...(label ? [el('span', 'highlight-lang', [text(label)])] : []),
    el('button', 'copy-btn', [text('Copy')], { type: 'button' }),
  ]);
  return el('div', 'highlight', [header, pre]);
}

export default function rehypeCodeBlock() {
  const visit = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === 'element' && child.tagName === 'pre' && child.children?.some((c) => c.tagName === 'code')) {
        return wrap(child);
      }
      visit(child);
      return child;
    });
  };
  return (tree) => visit(tree);
}
