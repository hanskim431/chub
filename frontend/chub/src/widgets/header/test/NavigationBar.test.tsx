import { render, screen } from "@testing-library/react";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import NavigationBar from "@/widgets/header/ui/NavigationBar";
import { NAVIGATION_BAR_LINKS } from "@/widgets/header/model/constants";
import userEvent from "@testing-library/user-event";

describe("네비게이션 바", () => {
  test("네비게이션 바가 랜더링된다.", () => {
    render(
      <MemoryRouterWrapped
        component={<NavigationBar />}
        initialEntries={["/test"]}
        path="/test"
      />
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("네비게이션 바의 링크들이 랜더링된다.", () => {
    const links = Object.values(NAVIGATION_BAR_LINKS);
    render(
      <MemoryRouterWrapped
        component={<NavigationBar />}
        initialEntries={["/test"]}
        path="/test"
      />
    );
    links.forEach(({ text }) => {
      expect(screen.getByRole("link", { name: text })).toBeInTheDocument();
    });
  });

  test.each(Object.values(NAVIGATION_BAR_LINKS))(
    "$text 링크를 클릭하면 $path 페이지로 이동한다.",
    async ({ text, label }) => {
      const user = userEvent.setup();
      render(
        <MemoryRouterWrapped
          component={<NavigationBar />}
          initialEntries={["/test"]}
          path="/test"
        />
      );
      const link = screen.getByRole("link", { name: text });
      await user.click(link);
      expect(screen.getByRole("main", { name: label })).toBeInTheDocument();
    }
  );
});
