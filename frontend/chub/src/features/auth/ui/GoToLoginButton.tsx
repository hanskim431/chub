import { Link } from 'react-router-dom';

function GoToLoginButton() {
  return (
    <Link
      to="/login"
      aria-label="login-button"
      className="bg-point hover:bg-point/80 rounded-md px-4 py-2 text-sm font-medium text-white"
    >
      로그인
    </Link>
  );
}

export default GoToLoginButton;
