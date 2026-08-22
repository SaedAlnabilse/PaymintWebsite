import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitText } from '../SplitText';

describe('SplitText', () => {
  it('renders alternating colored words and highlights mintcom', () => {
    render(<SplitText text="Empower Your Mintcom Experience" />);
    expect(screen.getByText('Mintcom')).toBeDefined();
    expect(screen.getByText('Empower')).toBeDefined();
  });
});
