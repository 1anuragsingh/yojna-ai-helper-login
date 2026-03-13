import { useLocation, useNavigate } from "react-router-dom";
import { Home, User, FileText, Calculator, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const items = [
    { path: "/", icon: Home, label: t("home") },
    { path: "/calculator", icon: Calculator, label: "Calculator" },
    { path: "/schemes", icon: FileText, label: t("schemes") },
    { path: "/profile", icon: User, label: t("profile") },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-between py-2 px-2">
        <div className="flex flex-1 items-center justify-around">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`h-6 w-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {user && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-muted-foreground hover:text-foreground transition-all">
                <LogOut className="h-6 w-6" />
                <span className="text-[11px] font-medium">Logout</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You'll need to login again to access the app.
              </AlertDialogDescription>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
