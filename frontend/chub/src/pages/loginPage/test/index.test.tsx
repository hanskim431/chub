import { render, screen } from '@testing-library/react';
import MemoryRouterWrapped from '@/app/routes/MemoryRouterWrapped';
import LoginPage from '@/pages/loginPage/page/index';
import { SOCIAL_LOGIN_REQUEST_PATHS } from '@/features/auth/model/constants';

describe('LoginPage', () => {
  beforeEach(() => {
    render(<MemoryRouterWrapped component={<LoginPage />} />);
  });

  test('LoginPage 페이지가 렌더링 된다.', () => {
    expect(
      screen.getByRole('main', { name: 'login-page' }),
    ).toBeInTheDocument();
  });

  test('소셜 로그인 버튼이 렌더링 된다.', () => {
    const socialLoginRequestText = Object.values(SOCIAL_LOGIN_REQUEST_PATHS);
    socialLoginRequestText.forEach(({ path }) => {
      expect(
        screen.getByRole('button', { name: /oauth-login-button/i }),
      ).toBeInTheDocument();
    });
  });
});
