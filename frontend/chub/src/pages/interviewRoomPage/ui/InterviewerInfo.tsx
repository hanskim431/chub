interface InterviewerInfoProps {
  name: string;
  avatar: string;
  company?: string;
  position?: string;
  field?: string;
  interviewStyle?: string;
}

export function InterviewerInfo({
  name,
  avatar,
  company,
  position,
  field,
  interviewStyle,
}: InterviewerInfoProps) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          {company && position && (
            <p className="text-sm text-gray-600">
              {company} · {position}
            </p>
          )}
        </div>
      </div>

      {field && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">전문 분야</h3>
          <p className="text-sm text-gray-600">{field}</p>
        </div>
      )}

      {interviewStyle && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">면접 스타일</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{interviewStyle}</p>
        </div>
      )}
    </div>
  );
}

