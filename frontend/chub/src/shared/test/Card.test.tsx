import { render, screen } from "@testing-library/react";
import Card from "@/shared/ui/Card";

describe("Card", () => {
  test("Card가 렌더링 된다.", () => {
    render(<Card children={<div>test</div>} />);
    expect(screen.getByLabelText("card")).toBeInTheDocument();
  });
  test("Card의 자식 요소가 렌더링 된다.", () => {
    render(<Card children={<div>test</div>} />);
    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
