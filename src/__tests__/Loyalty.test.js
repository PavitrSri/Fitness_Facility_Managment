import { render, screen} from '@testing-library/react';
import Loyalty from '../components/Loyalty';

test('Display Loyalty Discount', async () => {
	render(<Loyalty />);
	document.cookie = "testAccount";
	await new Promise((r) => setTimeout(r, 1000));
	expect(screen.getByText(/testAccount: Loyalty Discount: 7%/i)).toBeInTheDocument();
});
