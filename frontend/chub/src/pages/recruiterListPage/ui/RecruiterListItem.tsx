import type { RecruiterOverview } from "@mocks/model/constants";
import { Link } from "react-router-dom";
import Card from "@/shared/ui/Card";
import Pill from "@/shared/ui/Pill";
function RecruiterListItem({
  recruiterOverview,
}: {
  recruiterOverview: RecruiterOverview;
}) {
  return (
    <Card
      width="full"
      height="full"
      className="relative transition-all duration-200 has-[a:hover]:shadow-xl has-[a:hover]:scale-[1.02] has-[a:hover]:border-point-400 has-[button:hover]:shadow-xl has-[button:hover]:scale-[1.02] has-[button:hover]:border-point-400 p-6"
    >
      <Link
        to={`/interviewers/${recruiterOverview.id}`}
        className="absolute hover:cursor-pointer inset-0 z-0"
        aria-label="면접관 상세 페이지 링크"
      />
      <div
        aria-label="RecruiterListItem"
        className="flex flex-col items-start justify-between gap-5 w-full h-full"
      >
        <div className="flex items-start justify-start gap-5 w-full">
          <img
            src={recruiterOverview.avatar}
            alt={recruiterOverview.name}
            aria-label={recruiterOverview.name}
            className="w-24 h-24 rounded-xl object-cover shrink-0 border-2 border-point-100"
          />
          <div className="flex flex-col flex-1 w-full items-start justify-start gap-3 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap w-full">
              <span className="text-xl font-bold text-text-black">
                {recruiterOverview.name}
              </span>
              <Pill color="gray">{recruiterOverview.field}</Pill>
            </div>

            <div className="flex flex-col items-start justify-start gap-2.5 w-full">
              <span
                aria-label={
                  recruiterOverview.company + " " + recruiterOverview.position
                }
                className="text-sm text-text-gray font-medium"
              >
                {recruiterOverview.company + " · " + recruiterOverview.position}
              </span>
              <p className="text-sm text-text-black leading-relaxed line-clamp-2">
                {recruiterOverview.bio}
              </p>
              <div className="flex items-center justify-start gap-2 flex-wrap">
                {recruiterOverview.experiences.map((experience, index) => (
                  <Pill key={index} color="point">
                    {"#" + experience.company}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 w-full mt-auto z-1 pt-2">
          <button
            onClick={() => {
              // todo: 면접 신청하기 기능 추가
              console.log("면접 신청하기");
            }}
            className="flex-1 rounded-lg border-2 border-point-400 bg-white px-4 py-2.5 text-sm font-semibold text-point-400 shadow-sm transition-all duration-300 hover:cursor-pointer hover:bg-point-100 hover:border-point-500 hover:text-point-500 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-point-500/60 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 z-10 relative"
          >
            면접 신청하기
          </button>
          <button
            onClick={() => {
              // todo: 메세지 보내기 기능 추가
              console.log("메세지 보내기");
            }}
            className="flex-1 rounded-lg border-2 border-point-400 bg-white px-4 py-2.5 text-sm font-semibold text-point-400 shadow-sm transition-all duration-300 hover:cursor-pointer hover:bg-point-100 hover:border-point-500 hover:text-point-500 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-point-500/60 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 z-10 relative"
          >
            메세지 보내기
          </button>
        </div>
      </div>
    </Card>
  );
}

export default RecruiterListItem;
