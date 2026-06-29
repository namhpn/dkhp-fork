import { render } from '@testing-library/react';
import App from './App';

test('renders Courses app', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Courses/i)).toBeInTheDocument();
});
