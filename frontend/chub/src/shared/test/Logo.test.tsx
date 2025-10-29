import { render, screen } from '@testing-library/react';
import Logo from '@/shared/ui/Logo';

describe('Logo', () => {
  test('Logo가 렌더링 된다', () => {
    render(<Logo />);
    expect(screen.getByLabelText('logo-image')).toBeInTheDocument();
  });
});
