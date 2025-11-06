import { RECRUITER_FILTER_LIST } from "@/pages/recruiterListPage/model/constants";
import { clsx } from "clsx";
import { useRecruiterFilterStore } from "@/pages/recruiterListPage/model/recruiterFilterStore";
export default function RecruiterFilter() {
  const field = useRecruiterFilterStore((state) => state.field);
  const setField = useRecruiterFilterStore((state) => state.setField);
  return (
    <div
      aria-label="RecruiterFilter"
      className="flex items-center justify-start gap-4 flex-wrap"
    >
      {Object.values(RECRUITER_FILTER_LIST).map((filter) => {
        if (filter !== field) {
          return (
            <span
              color="point"
              aria-label={filter}
              key={filter}
              onClick={() => {
                setField(filter);
              }}
              className={clsx(
                "bg-point-50 border-2 rounded-full items-center justify-center px-3 py-1 text-point-500 font-semibold text-md cursor-pointer",
                "hover:shadow-xl hover:scale-[1.02] hover:border-point-400"
              )}
            >
              {filter}
            </span>
          );
        } else {
          return (
            <span
              onClick={() => {
                setField("");
              }}
              aria-label={filter}
              className={clsx(
                "bg-point-300 border-2 border-point-500 rounded-full items-center justify-center px-3 py-1 text-point-700 text-md font-semibold cursor-pointer shadow-md",
                "hover:shadow-xl"
              )}
              aria-pressed="true"
            >
              {filter}
            </span>
          );
        }
      })}
    </div>
  );
}
