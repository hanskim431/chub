import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "@/shared/ui/Pagination";

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  onPageChange: vi.fn(),
};

describe("Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Pagination이 렌더링된다", () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("페이지 번호 클릭 시 onPageChange가 호출된다", () => {
    render(<Pagination {...defaultProps} />);

    const page2Button = screen.getByText("2");
    fireEvent.click(page2Button);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  test("현재 페이지가 활성화된다", () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const page3Button = screen.getByText("3");
    expect(page3Button).toHaveClass("bg-blue-600", "text-white");
  });

  test("첫 페이지에서 이전 버튼이 비활성화된다", () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[0];
    expect(prevButton).toBeDisabled();
  });

  test("마지막 페이지에서 다음 버튼이 비활성화된다", () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toBeDisabled();
  });

  test("많은 페이지에서 생략 표시가 나타난다", () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);

    expect(screen.getAllByText("...")).toHaveLength(2);
  });
});
