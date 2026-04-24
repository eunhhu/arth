module.exports = {
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: "src",
  // tsconfig uses baseUrl="./" so modules like "src/lib/util" are absolute
  // from the project root. Teach Jest the same by resolving from "<rootDir>/..".
  modulePaths: ["<rootDir>/.."],
  testMatch: [
    "**/*.spec.ts"
  ],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node"
};
