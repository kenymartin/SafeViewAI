import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Extend Jest's timeout for async operations
jest.setTimeout(10000);

// Configure React Testing Library
configure({
  asyncUtilTimeout: 5000,
  eventWrapper: (cb) => act(async () => {
    await cb();
  }),
  asyncWrapper: async (cb) => {
    let result;
    await act(async () => {
      result = await cb();
    });
    return result;
  }
});

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Ensure React.act is used instead of ReactDOMTestUtils.act
global.React = {
  ...global.React,
  act,
}; 