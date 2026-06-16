module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  env: {
    node: true,
  },
  ignorePatterns: [
    "**/*.js",
    "node_modules",
    "dist",
    ".turbo"
  ]
};
