import { render, screen } from '@testing-library/react';
import LoginButtonSkeleton from '@/widgets/header/ui/LoginButtonSkelton';

describe('LoginButtonSkeleton', () => {
  test('로그인 버튼 스켈레톤이 렌더링된다.', () => {
    render(<LoginButtonSkeleton />);
    expect(screen.getByLabelText('login-button-skeleton')).toBeInTheDocument();
  });
});
