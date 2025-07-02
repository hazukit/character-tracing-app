import '@testing-library/jest-dom';

// Extend jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toBeDisabled(): R;
    }
  }
}

// Suppress test warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // Suppress React act warnings
      if (
        (message.includes('An update to') && message.includes('act(...)')) ||
        (message.includes('Warning: An update to') && message.includes('act(...)'))
      ) {
        return;
      }
      
      // Suppress expected test errors (エラーハンドリングのテスト用)
      if (
        message.includes('Error fetching Pokemon:') ||
        message.includes('Failed to load character:')
      ) {
        return;
      }
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});