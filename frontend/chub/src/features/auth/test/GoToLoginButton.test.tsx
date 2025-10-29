import { render, screen } from "@testing-library/react";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import GoToLoginButton from "@/features/auth/ui/GoToLoginButton";
import userEvent from "@testing-library/user-event";

describe("로그인 버튼", () => {
  test("로그인 버튼이 렌더링 된다.", () => {
    render(<MemoryRouterWrapped component={<GoToLoginButton />} />);
    expect(
      screen.getByRole("link", { name: "login-button" })
    ).toBeInTheDocument();
  });

  test("로그인 버튼을 클릭하면 로그인 페이지로 이동한다.", async () => {
    const user = userEvent.setup();
    render(<MemoryRouterWrapped component={<GoToLoginButton />} />);
    const loginButton = screen.getByRole("link", { name: "login-button" });
    await user.click(loginButton);
    expect(
      screen.getByRole("main", { name: "login-page" })
    ).toBeInTheDocument();
  });
});
