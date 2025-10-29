import { render, screen } from '@testing-library/react';
import HomePage from '@/pages/homePage/page/index';
import MemoryRouterWrapped from '@/app/routes/MemoryRouterWrapped';

describe('HomePage', () => {
  test('메인 페이지가 렌더링 된다', () => {
    render(<MemoryRouterWrapped component={<HomePage />} />);
    
    expect(
      screen.getByRole('main', { name: /home-page/i }),
    ).toBeInTheDocument();
  });

  test('헤더 높이를 고려한 높이가 설정되어야 한다', () => {
    render(<MemoryRouterWrapped component={<HomePage />} />);
    
    const mainElement = screen.getByRole('main', { name: /home-page/i });
    expect(mainElement).toHaveClass('h-[calc(100vh-4rem)]');
  });
});
