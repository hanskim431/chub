import { render, screen } from "@testing-library/react";
import UserMenu from "@/widgets/header/ui/UserMenu";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import { server } from "@/test/setup";
import { http, HttpResponse } from "msw";
describe("UserMenu", () => {
  test("유저 메뉴가 렌더링된다.", () => {
    render(<MemoryRouterWrapped component={<UserMenu />} />);
    expect(screen.getByLabelText("user-menu")).toBeInTheDocument();
  });

  describe("로그인 중", () => {
    test("로딩 중이면 로그인 버튼이 보인다", () => {
      server.use(
        http.get(
          "/api/users/me",
          () =>
            HttpResponse.json({
              data: {
                data: null,
              },
              isLoading: true,
              error: null,
            }),
          { once: true } //한번만 이 응답을 주도록 설정
        )
      );

      render(<MemoryRouterWrapped component={<UserMenu />} />);
      expect(
        screen.getByRole("link", { name: "login-button" })
      ).toBeInTheDocument();
    });
  });

  describe("비로그인 상태", () => {
    test("비로그인 상태면 로그인 버튼이 보인다", () => {
      server.use(
        http.get(
          "/api/users/me",
          () =>
            HttpResponse.json({
              data: {
                data: null,
              },
              isLoading: false,
              error: null,
            }),
          { once: true } //한번만 이 응답을 주도록 설정
        )
      );

      render(<MemoryRouterWrapped component={<UserMenu />} />);
      expect(
        screen.getByRole("link", { name: "login-button" })
      ).toBeInTheDocument();
    });
  });
  describe("로그인 상태", async () => {
    test("로그인 상태면 유저 메뉴가 보인다", async () => {
      console.log(import.meta.env.VITE_API_URL);
      render(<MemoryRouterWrapped component={<UserMenu />} />);
      expect(
        await screen.findByText("이찬님", undefined, { timeout: 3000 })
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText("logout-button", undefined, {
          timeout: 3000,
        })
      ).toBeInTheDocument();
    });
  });
});
