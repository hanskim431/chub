import { render, screen, fireEvent } from "@testing-library/react";
import LoginButton from "../ui/LoginButton";

describe("LoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("카카오 로그인 버튼을 클릭하면 onClick이 호출된다", () => {
    const mockOnClick = vi.fn();

    render(<LoginButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "oauth-login-button" });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("카카오 로그인 버튼이 올바른 스타일을 가지고 있다", () => {
    const mockOnClick = vi.fn();

    render(<LoginButton onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "oauth-login-button" });
    expect(button).toHaveClass(
      "flex",
      "w-full",
      "items-center",
      "justify-center"
    );
  });

  it("카카오 로고 이미지가 올바르게 렌더링된다", () => {
    const mockOnClick = vi.fn();

    render(<LoginButton onClick={mockOnClick} />);

    const image = screen.getByAltText("kakao-logo");
    expect(image).toHaveAttribute("src", "/kakao_login_medium_narrow.png");
  });
});
