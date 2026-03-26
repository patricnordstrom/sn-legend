module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: { '\\.[jt]sx?$': 'babel-jest' },
  transformIgnorePatterns: [],
  coverageReporters: ['text-summary', 'lcov'],
  coverageDirectory: './coverage',
};
