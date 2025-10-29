import { Link } from "react-router-dom";
import Logo from "@/shared/ui/Logo";

function LogoLink() {
  return (
    <Link to="/" aria-label="logo-link" className="flex items-center">
      <Logo className="h-10 w-auto" />
      <p className="text-point text-2xl font-extrabold">cHub</p>
    </Link>
  );
}

export default LogoLink;
