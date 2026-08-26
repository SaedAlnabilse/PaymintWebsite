import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OfflineDinoScreen } from './OfflineDinoScreen';

describe('OfflineDinoScreen', () => {
  it('renders offline message and instructions when forced or offline', () => {
    render(<OfflineDinoScreen forceShow />);

    expect(screen.getByRole('region', { name: /No Internet Connection/i })).toBeInTheDocument();
    expect(screen.getByText(/Press space to play/i)).toBeInTheDocument();
    expect(screen.getByText(/Checking the network cables, modem, and router/i)).toBeInTheDocument();
    expect(screen.getByText(/Reconnecting to Wi-Fi/i)).toBeInTheDocument();
    expect(screen.getByText(/ERR_INTERNET_DISCONNECTED/i)).toBeInTheDocument();
  });

  it('allows clicking check connection button and does not render cached version button', () => {
    render(<OfflineDinoScreen forceShow />);
    const checkBtn = screen.getByRole('button', { name: /Check Connection/i });
    expect(checkBtn).toBeInTheDocument();
    fireEvent.click(checkBtn);

    expect(screen.queryByText(/Use Cached Version/i)).not.toBeInTheDocument();
  });
});
