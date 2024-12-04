module.exports = {
  "root": true,
  "env": {
      "es6": true,
      "node": true
  },
  "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "project": null  // Removed TypeScript project requirement
  },
  "plugins": [
      "@typescript-eslint"
  ],
  "ignorePatterns": [
      "/lib/**/*",  // Ignore built files
      ".eslintrc.js"  // Ignore the eslint config itself
  ],
  "rules": {
      "indent": "off",
      "@typescript-eslint/indent": "off",
      "quotes": ["error", "double"],
      "require-jsdoc": ["error", {
          "require": {
              "FunctionDeclaration": true,
              "MethodDefinition": true,
              "ClassDeclaration": true,
              "ArrowFunctionExpression": true,
              "FunctionExpression": true
          }
      }],
      "comma-dangle": ["error", "always-multiline"],
      "arrow-parens": ["error", "always"],
      "no-trailing-spaces": "error",
      "padded-blocks": ["error", "never"],
      "eol-last": ["error", "always"]
  }
};