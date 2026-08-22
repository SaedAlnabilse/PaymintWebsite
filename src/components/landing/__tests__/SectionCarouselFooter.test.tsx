import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionCarouselFooter } from '../SectionCarouselFooter';

describe('SectionCarouselFooter', () => {
  it('renders navigation buttons and progress dots', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onJumpTo = vi.fn();

    render(
      <SectionCarouselFooter
        totalCount={5}
        activeIndex={2}
        onPrev={onPrev}
        onNext={onNext}
        onJumpTo={onJumpTo}
        prevLabel="Back"
        nextLabel="Forward"
      />,
    );

    const prevBtn = screen.getByRole('button', { name: 'Back' });
    const nextBtn = screen.getByRole('button', { name: 'Forward' });
    expect(prevBtn).toBeDefined();
    expect(nextBtn).toBeDefined();

    fireEvent.click(prevBtn);
    expect(onPrev).toHaveBeenCalledTimes(1);

    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledTimes(1);

    const dot3 = screen.getByRole('button', { name: 'Go to 3' });
    fireEvent.click(dot3);
    expect(onJumpTo).toHaveBeenCalledWith(2);
  });
});
