import { render, screen } from "@testing-library/react";
import UserMenu from "@/widgets/header/ui/UserMenu";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import { useMe } from "@/features/auth/api/me";

vi.mock("@/features/auth/api/me", () => ({
  useMe: vi.fn(),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("유저 메뉴가 렌더링된다.", () => {
    vi.mocked(useMe).mockReturnValue({
      data: {
        data: null,
      },
      isLoading: true,
      error: null,
    });
    render(<MemoryRouterWrapped component={<UserMenu />} />);
    expect(screen.getByLabelText("user-menu")).toBeInTheDocument();
  });

  describe("로그인 중", () => {
    test("로딩 중이면 로그인 버튼이 보인다", () => {
      vi.mocked(useMe).mockReturnValue({
        data: {
          data: null,
        },
        isLoading: true,
        error: null,
      });

      render(<MemoryRouterWrapped component={<UserMenu />} />);
      expect(
        screen.getByRole("link", { name: "login-button" })
      ).toBeInTheDocument();
    });
  });

  describe("비로그인 상태", () => {
    test("비로그인 상태면 로그인 버튼이 보인다", () => {
      vi.mocked(useMe).mockReturnValue({
        data: {
          data: {
            nickname: "",
          },
        },
        isLoading: false,
        error: null,
      });

      render(<MemoryRouterWrapped component={<UserMenu />} />);
      expect(
        screen.getByRole("link", { name: "login-button" })
      ).toBeInTheDocument();
    });
  });
  describe("로그인 상태", () => {
    test("로그인 상태면 유저 메뉴가 보인다", () => {
      vi.mocked(useMe).mockReturnValue({
        data: {
          data: {
            nickname: "이찬",
          },
        },
        isLoading: false,
        error: null,
      });

      render(<MemoryRouterWrapped component={<UserMenu />} />);
      expect(screen.getByText("이찬님")).toBeInTheDocument();
      expect(screen.getByLabelText("logout-button")).toBeInTheDocument();
    });
  });
});
