interface LoginButtonProps {
  onClick: () => void;
}

function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="oauth-login-button"
      className="flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-sm font-medium text-black transition"
    >
      <img
        src="/kakao_login_medium_narrow.png"
        alt="kakao-logo"
        className="transition-transform hover:scale-98"
      />
    </button>
  );
}

export default LoginButton;
