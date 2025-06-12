module.exports = {
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: "src",
  testMatch: [ // Changed from testRegex to testMatch for clarity
    "**/*.spec.ts"
  ],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverage: true, // Added collectCoverage
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node"
};
