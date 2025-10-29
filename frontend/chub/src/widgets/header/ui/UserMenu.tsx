import { useQueryClient } from "@tanstack/react-query";
import { post } from "@/shared/api/api";
import GoToLoginButton from "@/features/auth/ui/GoToLoginButton";
import { useMe } from "@/features/auth/api/me";

function UserMenu() {
  const qc = useQueryClient();
  const { data, isLoading } = useMe();
  const nickname = data?.data?.name ?? "";
  const handleLogout = async () => {
    await post("/api/users/logout");
    qc.setQueryData(["me"], null);
  };
  return (
    <div aria-label="user-menu" className="flex items-center gap-4">
      {isLoading || nickname === "" ? (
        <GoToLoginButton />
      ) : (
        <>
          <span className="text-sm font-bold text-gray-600">{nickname}님</span>
          <button
            onClick={handleLogout}
            aria-label="logout-button"
            className="focus-visible:ring-point-400 inline-flex h-8 items-center gap-2 rounded-md bg-white px-4 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99] disabled:opacity-50"
          >
            로그아웃
          </button>
        </>
      )}
    </div>
  );
}

export default UserMenu;
