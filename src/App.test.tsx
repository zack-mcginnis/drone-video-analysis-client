import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/my pwa/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders welcome message', () => {
    render(<App />);
    const welcomeMessage = screen.getByText(/welcome to my progressive web app/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});
