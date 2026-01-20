import { render, screen } from '@testing-library/react';
import GymHours from '../components/GymHours';

test('shows gym hours on screen', () => {
  render(<GymHours onBack={() => {}} />);

  //should check if the hours are shown
  expect(screen.getByText("Monday - Friday: 6 a.m - 11 p.m")).toBeInTheDocument();
  expect(screen.getByText("Saturday - Sunday: 8 a.m - 10 p.m")).toBeInTheDocument();
});
