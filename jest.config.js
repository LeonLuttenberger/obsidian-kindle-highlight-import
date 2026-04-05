module.exports = {
  verbose: true,
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // 1. Ensure it's pointing to your modern config
        tsconfig: "tsconfig.json",
        // 2. Tell ts-jest to ignore the deprecation warnings
        diagnostics: {
          ignoreCodes: [5107, 5101],
        },
      },
    ],
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
