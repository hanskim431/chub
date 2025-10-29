import { render, screen } from '@testing-library/react';
import LogoLink from '@/widgets/header/ui/LogoLink';
import MemoryRouterWrapped from '@/app/routes/MemoryRouterWrapped';
import userEvent from '@testing-library/user-event';

describe('LogoLink', () => {
  test('LogoLink가 렌더링 된다.', () => {
    render(<MemoryRouterWrapped component={<LogoLink />} />);
    expect(screen.getByRole('link', { name: 'logo-link' })).toBeInTheDocument();
  });

  test('사용자가 LogoLink를 클릭하면 홈페이지로 이동한다.', async () => {
    render(<MemoryRouterWrapped component={<LogoLink />} />);
    const logoLink = screen.getByRole('link', { name: 'logo-link' });
    await userEvent.click(logoLink);
    expect(window.location.pathname).toBe('/');
  });
});
