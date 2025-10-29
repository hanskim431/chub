import { render, screen } from "@testing-library/react";
import Header from "@/widgets/header";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import { useMe } from "@/features/auth/api/me";
import { vi } from "vitest";

vi.mock("@/features/auth/api/me", () => ({
  useMe: vi.fn(),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("헤더에 로고가 렌더링 된다.", () => {
    vi.mocked(useMe).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<MemoryRouterWrapped component={<Header />} />);
    expect(screen.getByRole("img", { name: "logo-image" })).toBeInTheDocument();
  });

  test("해더에 유저 메뉴가 렌더링 된다", () => {
    render(<MemoryRouterWrapped component={<Header />} />);
    expect(screen.getByLabelText("user-menu")).toBeInTheDocument();
  });
});
