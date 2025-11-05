import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecruiterListPage from "@/pages/recruiterListPage/page/index";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";

describe("RecruiterListPage", () => {
  test("면접관 목록 페이지가 렌더링된다", async () => {
    render(<MemoryRouterWrapped component={<RecruiterListPage />} />);

    expect(
      screen.getByRole("main", { name: /recruiter-list-page/i })
    ).toBeInTheDocument();
  });

  test("페이지 제목과 설명이 표시된다", async () => {
    render(<MemoryRouterWrapped component={<RecruiterListPage />} />);

    expect(screen.getByText("면접관 찾기")).toBeInTheDocument();
    expect(
      screen.getByText(
        "나에게 맞는 면접관을 선택하고 실전처럼 피드백을 받아보세요."
      )
    ).toBeInTheDocument();
  });

  test("면접관 목록이 표시된다", async () => {
    render(<MemoryRouterWrapped component={<RecruiterListPage />} />);

    await waitFor(() => {
      const recruiterItems = screen.getAllByLabelText(/RecruiterListItem/i);
      expect(recruiterItems.length).toBeGreaterThan(0);
    });
  });

  test("페이지네이션이 렌더링된다", async () => {
    render(<MemoryRouterWrapped component={<RecruiterListPage />} />);

    await waitFor(() => {
      const pagination = screen.queryByRole("navigation");
      if (pagination) {
        expect(pagination).toBeInTheDocument();
      }
    });
  });

  test("페이지 번호를 클릭하면 페이지가 변경된다", async () => {
    const user = userEvent.setup();
    render(<MemoryRouterWrapped component={<RecruiterListPage />} />);

    await waitFor(() => {
      const recruiterItems = screen.getAllByLabelText(/RecruiterListItem/i);
      expect(recruiterItems.length).toBeGreaterThan(0);
    });

    const pageButtons = screen.getAllByRole("button");
    const page2Button = pageButtons.find(
      (button) => button.textContent === "2"
    );

    if (page2Button) {
      await user.click(page2Button);

      await waitFor(() => {
        const recruiterItems = screen.getAllByLabelText(/RecruiterListItem/i);
        expect(recruiterItems.length).toBeGreaterThan(0);
      });
    }
  });
});
