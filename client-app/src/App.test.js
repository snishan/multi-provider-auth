import { render, screen } from '@testing-library/react';
import App from './App';

// Mock window.matchMedia for React Router v6 and styled-components compatibility
beforeAll(() => {
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
});

test('renders app name and login button on initial load', () => {
  render(<App />);
  // Check for app name in Navbar
  expect(screen.getByText(/social login app/i)).toBeInTheDocument();
  // Check for login button or link
  expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
});
