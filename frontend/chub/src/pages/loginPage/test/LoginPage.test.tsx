import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../page/index";
import { redirectToSocialLogin } from "../model/utils";

// redirectToSocialLogin 함수 모킹
vi.mock("../model/utils", () => ({
  redirectToSocialLogin: vi.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 환경변수 설정
    import.meta.env.VITE_API_URL = "http://localhost:8080";
  });

  it("카카오 로그인 버튼을 클릭하면 OAuth 리다이렉트가 발생한다", async () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole("button", {
      name: "oauth-login-button",
    });
    fireEvent.click(loginButton);

    // redirectToSocialLogin이 호출되었는지 확인
    expect(redirectToSocialLogin).toHaveBeenCalledWith(
      "/oauth2/authorization/kakao"
    );
  });

  it("로그인 페이지가 올바르게 렌더링된다", () => {
    render(<LoginPage />);

    expect(screen.getByText("로그인하기")).toBeInTheDocument();
    expect(
      screen.getByText("간편 로그인으로 바로 시작하세요.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "oauth-login-button" })
    ).toBeInTheDocument();
  });
});
