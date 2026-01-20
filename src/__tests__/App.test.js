import { render, screen } from '@testing-library/react';
import App from '../App';

test('shows welcome text', () => {
  render(<App />);
  expect(screen.getByText(/Welcome to Spot Fitness/i)).toBeInTheDocument();
});
