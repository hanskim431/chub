import { render, screen } from '@testing-library/react';
import MemoryRouterWrapped from '@/app/routes/MemoryRouterWrapped';
import GuestLoginButton from '@/pages/loginPage/ui/GuestLoginButton';

describe('GuestLoginButton', () => {
  test('GuestLoginButton이 렌더링 된다.', () => {
    render(<MemoryRouterWrapped component={<GuestLoginButton />} />);
    expect(
      screen.getByRole('button', { name: 'guest-login-button' }),
    ).toBeInTheDocument();
  });
});
