import { fireEvent, render, screen } from "@testing-library/react";
import { RECRUITER_FILTER_LIST } from "@/pages/recruiterListPage/model/constants";
import RecruiterFilter from "@/pages/recruiterListPage/ui/RecruiterFilter";

describe("RecruiterFilter", () => {
  test("RecruiterFilter가 랜더링된다.", () => {
    render(<RecruiterFilter />);
    expect(screen.getByLabelText("RecruiterFilter")).toBeInTheDocument();
  });
  test("RecruiterFilter의 필터 버튼이 랜더링된다.", () => {
    render(<RecruiterFilter />);
    Object.values(RECRUITER_FILTER_LIST).forEach((filter) => {
      expect(screen.getByLabelText(filter)).toBeInTheDocument();
    });
  });
  test("RecruiterFilter의 필터 버튼이 클릭되면 해당 필터가 스토어에 저장된다.", () => {
    render(<RecruiterFilter />);
    const targetFilter = RECRUITER_FILTER_LIST.frontend;
    const filterButton = screen.getByRole("button", { name: targetFilter });
    fireEvent.click(filterButton);
    expect(filterButton).toHaveAttribute("aria-pressed", "true");
  });
});
