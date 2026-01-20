import { render, screen } from '@testing-library/react';
import ViewTrainers from '../components/ViewTrainers';

test('displays the full trainer list', () => {
  render(<ViewTrainers onBack={() => {}} />);

  //check if trainer names appear
  expect(screen.getByText("T1")).toBeInTheDocument();
  expect(screen.getByText("T2")).toBeInTheDocument();
  expect(screen.getByText("T3")).toBeInTheDocument();
  expect(screen.getByText("T4")).toBeInTheDocument();
});
