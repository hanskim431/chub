import { NAVIGATION_BAR_LINKS } from "@/widgets/header/model/constants";
import { Link } from "react-router-dom";

function NavigationBar() {
  const links = Object.entries(NAVIGATION_BAR_LINKS);
  return (
    <nav>
      <ul className="flex items-center gap-4 text-sm font-medium">
        {links.map(([key, value]) => (
          <li key={key}>
            <Link
              to={value.path}
              className="hover:bg-hover-gray rounded-md px-4 py-2"
            >
              {value.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavigationBar;
