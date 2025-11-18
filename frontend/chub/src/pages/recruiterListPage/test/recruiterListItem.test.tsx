import { render, screen } from "@testing-library/react";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import {
  mockRecruiters,
  type Recruiter,
  type RecruiterOverview,
} from "@mocks/model/constants";
import RecruiterListItem from "@/pages/recruiterListPage/ui/RecruiterListItem";
let recruiters: Recruiter = mockRecruiters[0];

const mockRecruiter: RecruiterOverview = {
  id: recruiters.id,
  userId: Number(recruiters.id),
  name: recruiters.name,
  avatar: recruiters.avatar,
  field: recruiters.field,
  company: recruiters.company,
  position: recruiters.position,
  bio: recruiters.bio,
  specialties: recruiters.specialties,
  experiences: recruiters.experiences,
  price: recruiters.price,
};

describe("사용자는 면접관 정보를 볼 수 있다.", () => {
  test("recruiterListItem이 랜더링 된다.", async () => {
    render(
      <MemoryRouterWrapped
        component={<RecruiterListItem recruiterOverview={mockRecruiter} />}
      />
    );
    expect(
      await screen.findByLabelText("RecruiterListItem")
    ).toBeInTheDocument();
  });

  test("RecruiterListItem의 정보가 랜더링 된다.", async () => {
    render(
      <MemoryRouterWrapped
        component={<RecruiterListItem recruiterOverview={mockRecruiter} />}
      />
    );
    expect(await screen.findByText(mockRecruiter.name)).toBeInTheDocument();
    expect(
      await screen.findByRole("img", { name: mockRecruiter.name })
    ).toBeInTheDocument();
    expect(await screen.findByText(mockRecruiter.field)).toBeInTheDocument();
    expect(
      await screen.findByLabelText(
        mockRecruiter.company + " " + mockRecruiter.position
      )
    ).toBeInTheDocument();
    expect(await screen.findByText(mockRecruiter.bio)).toBeInTheDocument();
    mockRecruiter.experiences.forEach(
      async (experience: { company: string }) => {
        expect(await screen.findByText(experience.company)).toBeInTheDocument();
      }
    );
  });
  // test("RecruiterListItem을 클릭하면 해당 면접관의 상세 정보 페이지로 이동한다.", async () => {
  //   render(
  //     <MemoryRouterWrapped
  //       component={<RecruiterListItem recruiterOverview={mockRecruiter} />}
  //     />
  //   );
  //   const recruiterListItem = await screen.findByLabelText(
  //     "면접관 상세 페이지 링크"
  //   );
  //   await userEvent.click(recruiterListItem);
  //   expect(window.location.pathname).toBe(`/interviewers/${mockRecruiter.id}`);
  // });
});
