import { render, screen } from "@testing-library/react";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import NavigationBar from "@/widgets/header/ui/NavigationBar";
import { NAVIGATION_BAR_LINKS } from "@/widgets/header/model/constants";
import userEvent from "@testing-library/user-event";

describe("네비게이션 바", () => {
  test("네비게이션 바가 랜더링된다.", () => {
    render(<MemoryRouterWrapped component={<NavigationBar />} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("네비게이션 바의 링크들이 랜더링된다.", () => {
    const links = Object.values(NAVIGATION_BAR_LINKS);
    render(<MemoryRouterWrapped component={<NavigationBar />} />);
    links.forEach(({ text }) => {
      expect(screen.getByRole("link", { name: text })).toBeInTheDocument();
    });
  });

  test("네비게이션 바의 링크를 클릭하면 해당 페이지로 이동한다.", async () => {
    const links = Object.values(NAVIGATION_BAR_LINKS);
    render(<MemoryRouterWrapped component={<NavigationBar />} />);

    for (const { text } of links) {
      const link = screen.getByRole("link", { name: text });
      await userEvent.click(link);
      expect(window.location.pathname).toBe(link.getAttribute("href"));
    }
  });
});
