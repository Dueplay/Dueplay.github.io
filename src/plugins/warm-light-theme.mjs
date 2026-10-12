// 温暖浅色代码配色 - 与网站整体风格协调
export default {
  name: 'warm-light',
  type: 'light',
  colors: {
    'editor.background': '#fefdfb',
    'editor.foreground': '#1a1a1a'
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6b7280', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control'], settings: { foreground: '#7c3aed' } },
    { scope: ['keyword.operator', 'keyword.control.import', 'keyword.control.from', 'keyword.control.directive', 'entity.name.tag'], settings: { foreground: '#db2777' } },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inserted'], settings: { foreground: '#059669' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#0284c7' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.class'], settings: { foreground: '#d97706' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other', 'support.constant'], settings: { foreground: '#ea580c' } },
    { scope: ['entity.other.attribute-name', 'support.type', 'variable.language', 'meta.decorator', 'support.type.property-name'], settings: { foreground: '#0891b2' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#374151' } },
    { scope: ['variable', 'variable.other', 'variable.parameter'], settings: { foreground: '#1a1a1a' } },
    { scope: ['markup.deleted', 'invalid'], settings: { foreground: '#dc2626' } },
    { scope: ['markup.heading'], settings: { foreground: '#0284c7', fontStyle: 'bold' } },
    { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
  ],
};
