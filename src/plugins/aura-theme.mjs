// Aura 暗色代码配色
export default {
  name: 'aura',
  type: 'dark',
  colors: { 'editor.background': '#15141b', 'editor.foreground': '#edecee' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6d6d6d', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control'], settings: { foreground: '#a277ff' } },
    { scope: ['keyword.operator', 'keyword.control.import', 'keyword.control.from', 'keyword.control.directive', 'entity.name.tag'], settings: { foreground: '#f694ff' } },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inserted'], settings: { foreground: '#61ffca' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call', 'entity.name.type', 'entity.name.class', 'support.class'], settings: { foreground: '#61ffca' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other', 'support.constant'], settings: { foreground: '#ffca85' } },
    { scope: ['entity.other.attribute-name', 'support.type', 'variable.language', 'meta.decorator', 'support.type.property-name'], settings: { foreground: '#82e2ff' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#edecee' } },
    { scope: ['variable', 'variable.other', 'variable.parameter'], settings: { foreground: '#edecee' } },
    { scope: ['markup.deleted', 'invalid'], settings: { foreground: '#ff6767' } },
    { scope: ['markup.heading'], settings: { foreground: '#82e2ff', fontStyle: 'bold' } },
    { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
  ],
};
