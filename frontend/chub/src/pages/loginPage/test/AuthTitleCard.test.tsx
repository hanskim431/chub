import { render, screen } from '@testing-library/react';
import AuthTitleCard from '@/pages/loginPage/ui/AuthTitleCard';

describe('AuthTitleCard', () => {
  test('AuthTitleCard가 렌더링 된다.', () => {
    render(
      <AuthTitleCard title="title" description="description">
        <div>test</div>
      </AuthTitleCard>,
    );
    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument();
  });
});
