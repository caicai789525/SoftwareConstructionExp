import { ReactNode, useState } from "react";
import { auth } from "../../../lib/auth";
import type { User } from "../../../types";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sparkles,
  ClipboardList,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({
  children,
  currentView,
  onViewChange,
  onLogout,
}: DashboardLayoutProps) {
  const user = auth.getUser() as User;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { id: "dashboard", label: "仪表板", icon: LayoutDashboard },
    ];

    if (user.role === "student") {
      return [
        ...commonItems,
        { id: "projects", label: "浏览项目", icon: FolderKanban },
        { id: "matches", label: "智能匹配", icon: Sparkles },
        { id: "applications", label: "我的申请", icon: FileText },
        { id: "progress", label: "进度跟踪", icon: TrendingUp },
      ];
    } else if (user.role === "teacher") {
      return [
        ...commonItems,
        { id: "my-projects", label: "我的项目", icon: FolderKanban },
        { id: "applications", label: "申请管理", icon: ClipboardList },
        { id: "progress", label: "进度跟踪", icon: TrendingUp },
        { id: "feedback", label: "反馈评价", icon: MessageSquare },
      ];
    } else if (user.role === "admin") {
      return [
        ...commonItems,
        { id: "users", label: "用户管理", icon: Users },
        { id: "projects", label: "项目管理", icon: FolderKanban },
        { id: "applications", label: "申请管理", icon: FileText },
        { id: "stats", label: "系统统计", icon: BarChart3 },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    auth.logout();
    onLogout();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <span className="font-semibold text-lg text-gray-900">
              科研实习系统
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => onViewChange("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === "settings"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>设置</span>}
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="font-semibold text-lg text-gray-900">
                科研实习系统
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>退出登录</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="搜索..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {user.role === "student"
                        ? "学生"
                        : user.role === "teacher"
                        ? "教师"
                        : "管理员"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>{user.name}</div>
                  <div className="text-xs font-normal text-gray-500">
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
