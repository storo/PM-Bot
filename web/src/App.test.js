import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders PM-Bot Frontend heading', () => {
    render(<App />);
    expect(screen.getByText(/PM-Bot Frontend/i)).toBeInTheDocument();
  });
});