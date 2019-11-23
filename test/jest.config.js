module.exports = {
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "[a-zA-Z0-9-\\/]+(\\.test\\.ts)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  include: [
    "typings-custom/*.ts"
  ]
};
