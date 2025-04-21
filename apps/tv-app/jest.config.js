module.exports = {
  setupFilesAfterEnv: [
    '<rootDir>/src/renderer/components/__tests__/setup.ts',
    '@testing-library/jest-dom'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testTimeout: 10000,
  verbose: true,
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 