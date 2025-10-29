import { postGuestLogin } from "@/entities/user/api/requests";
import { User } from "lucide-react";

function GuestLoginButton() {
  postGuestLogin().then((res) => {
    console.log(res);
  });

  return (
    <button
      aria-label="guest-login-button"
      onClick={() => postGuestLogin()}
      className="w-full max-w-[180px] rounded-md bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:outline-none active:scale-[0.98]"
    >
      <div className="flex items-center gap-8">
        <User className="h-4 w-4" />
        게스트 로그인
      </div>
    </button>
  );
}

export default GuestLoginButton;
