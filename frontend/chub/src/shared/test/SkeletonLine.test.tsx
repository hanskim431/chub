import { render, screen } from '@testing-library/react';
import SkeletonLine from '@/shared/ui/SkeletonLine';

describe('SkeletonLine', () => {
  test('SkeletonLine 컴포넌트가 렌더링 된다.', () => {
    render(<SkeletonLine />);
    expect(screen.getByRole('line')).toBeInTheDocument();
  });
});
