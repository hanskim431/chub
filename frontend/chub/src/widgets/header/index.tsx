import NavigationBar from "@/widgets/header/ui/NavigationBar";
import LogoLink from "@/widgets/header/ui/LogoLink";
import UserMenu from "@/widgets/header/ui/UserMenu";

function Header() {
  return (
    <header className="text-text-black border-underline-gray flex items-center justify-between min-h-16 w-full border-b px-32">
      <LogoLink />
      <NavigationBar />
      <UserMenu />
    </header>
  );
}

export default Header;
