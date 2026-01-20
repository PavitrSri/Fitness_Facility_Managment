import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DisplayInventory from '../components/DisplayInventory';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      text: () =>
        Promise.resolve(
          'Eq ID, TypeID, Eq Name, Eq Description, IsBooked\n1000,1,Treadmill,Fitness equipment,no\n2000,2,Basketball,Spalding NBA Official Game Ball,yes'
        )
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

//Unit test 1 for use case 'Display inventory'
test('displays the inventory header', async () => {
  render(<DisplayInventory onBack={() => {}} />);

  await waitFor(() => expect(screen.getByText(/Inventory/i)).toBeInTheDocument());
});

//Unit test 2 for use case 'Display inventory'
test('displays fetched inventory items', async () => {
  render(<DisplayInventory onBack={() => {}} />);
  
  await waitFor(() => {
    expect(screen.getAllByText(/Eq ID/i).length).toBeGreaterThan(0);
  });
});
