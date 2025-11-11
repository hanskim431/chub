import { UserProfileSection } from "../ui/UserProfileSection";
import { ResumeSection } from "../ui/ResumeSection";
import { InterviewerProfileSection } from "../ui/InterviewerProfileSection";

export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="space-y-6">
        {/* 내 프로필 */}
        <UserProfileSection />

        {/* 이력서 */}
        <ResumeSection />

        {/* 면접관 프로필 */}
        <InterviewerProfileSection />
      </div>
    </div>
  );
}
