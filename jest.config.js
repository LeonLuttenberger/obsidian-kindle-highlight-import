module.exports = {
  verbose: true,
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  reporters: ["default", "jest-junit"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "cobertura"],
};
