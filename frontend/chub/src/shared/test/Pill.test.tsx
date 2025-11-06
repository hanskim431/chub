import { render, screen } from '@testing-library/react';
import Pill from '@/shared/ui/Pill';

describe('Pill', () => {
  test('Pill 컴포넌트가 렌더링 된다.', () => {
    render(<Pill color="gray">test</Pill>);
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('test').className).toContain('border-gray-300');
    expect(screen.getByText('test').className).toContain('bg-gray-50');
    expect(screen.getByText('test').className).toContain('text-gray-700');
  });
});
