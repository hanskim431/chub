import { render, screen } from "@testing-library/react";
import Header from "@/widgets/header";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";

describe("Header", () => {
  test("헤더에 로고가 렌더링 된다.", () => {
    render(<MemoryRouterWrapped component={<Header />} />);
    expect(screen.getByRole("img", { name: "logo-image" })).toBeInTheDocument();
  });

  test("해더에 유저 메뉴가 렌더링 된다", () => {
    render(<MemoryRouterWrapped component={<Header />} />);
    expect(screen.getByLabelText("user-menu")).toBeInTheDocument();
  });
});
