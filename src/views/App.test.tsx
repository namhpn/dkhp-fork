import { render } from '@testing-library/react';
import App from './App';

test('renders single-page course planner', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Đăng ký học phần UIT/i)).toBeInTheDocument();
});
