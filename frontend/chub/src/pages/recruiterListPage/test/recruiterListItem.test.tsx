import { render, screen } from "@testing-library/react";
import MemoryRouterWrapped from "@/app/routes/MemoryRouterWrapped";
import {
  mockRecruiters,
  type Recruiter,
  type recruiterOverview,
} from "@mocks/model/constants";
import RecruiterListItem from "@/pages/recruiterListPage/ui/RecruiterListItem";

let recruiters: Recruiter = mockRecruiters[0];

const mockRecruiter: recruiterOverview = {
  id: recruiters.id,
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
      await screen.findByRole("link", { name: "RecruiterListItem" })
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
    expect(await screen.findByText(mockRecruiter.company)).toBeInTheDocument();
    expect(await screen.findByText(mockRecruiter.position)).toBeInTheDocument();
    expect(await screen.findByText(mockRecruiter.bio)).toBeInTheDocument();
    mockRecruiter.experiences.forEach(
      async (experience: { company: string }) => {
        expect(await screen.findByText(experience.company)).toBeInTheDocument();
      }
    );
  });
});
