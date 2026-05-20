import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Library, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const getMenuItems = (t) => [

  {
    id: "profile",
    label: t("layout.accountSidebar.menuItems.profile"),
    icon: User,
    href: "/profile",
  },
  {
    id: "bookshelf",
    label: t("layout.accountSidebar.menuItems.bookshelf"),
    icon: Library,
    href: "/bookshelf",
  },
  {
    id: "transactions",
    label: t("layout.accountSidebar.menuItems.transactions"),
    icon: History,
    href: "/transactions",
  },
];

export function AccountSidebar() {
  const { t } = useTranslation();
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const pathname = location.pathname;
  const menuItems = getMenuItems(t); 

  return (
    <div className="w-64 h-full border-r border-border bg-card/30 pt-6 pb-4 px-4 flex flex-col gap-2">
      <nav className="space-y-1">
        {menuItems && menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-gray-100 text-primary" : "text-foreground hover:bg-gray-100 hover:text-foreground"}`}
                onClick={() => navigate(item.href)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}