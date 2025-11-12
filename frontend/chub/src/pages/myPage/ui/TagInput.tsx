import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "입력 후 Enter",
  disabled = false,
  label,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {/* 태그 목록 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  disabled
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(tag)}
                    className="hover:text-blue-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* 입력 필드 */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-white"
          }`}
        />

        <p className="text-xs text-gray-500">
          입력 후 Enter를 눌러 추가하세요
        </p>
      </div>
    </div>
  );
}
