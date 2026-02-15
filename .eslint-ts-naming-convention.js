module.exports = {
  rules: {
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
      { selector: 'function', format: ['camelCase', 'PascalCase'] },
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
      { selector: 'enum', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['UPPER_CASE'] },
    ],
  },
};
