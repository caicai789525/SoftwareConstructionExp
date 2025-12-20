import { useState, useEffect } from "react";
import { userApi, projectApi, applicationApi } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Loader2,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  TrendingUp,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        activeProjectsRes,
        archivedProjectsRes,
        applicationsRes,
      ] = await Promise.allSettled([
        userApi.getUsers(),
        projectApi.getProjects({ archived: 0 }),
        projectApi.getProjects({ archived: 1 }),
        applicationApi.getApplications({ fast: true }),
      ]);

      const users =
        usersRes.status === "fulfilled" && Array.isArray(usersRes.value)
          ? usersRes.value
          : [];
      const projectsActive =
        activeProjectsRes.status === "fulfilled" &&
        Array.isArray(activeProjectsRes.value)
          ? activeProjectsRes.value
          : [];
      const projectsArchived =
        archivedProjectsRes.status === "fulfilled" &&
        Array.isArray(archivedProjectsRes.value)
          ? archivedProjectsRes.value
          : [];
      const applications =
        applicationsRes.status === "fulfilled" &&
        Array.isArray(applicationsRes.value)
          ? applicationsRes.value
          : [];

      const students = users.filter((u) => u.role === "student");
      const teachers = users.filter((u) => u.role === "teacher");
      const admins = users.filter((u) => u.role === "admin");

      const projects = [...projectsActive, ...projectsArchived];
      const activeProjects = projects.filter((p) => !p.archived);
      const pendingApps = applications.filter(
        (a) => a.application.status === "submitted"
      );

      setStats({
        totalUsers: users.length,
        students: students.length,
        teachers: teachers.length,
        admins: admins.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalApplications: applications.length,
        pendingApplications: pendingApps.length,
      });
    } catch {
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">管理员仪表板</h1>
        <p className="text-gray-600 mt-2">欢迎回来！查看系统的整体运行情况</p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-gray-600">总用户数</div>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.activeProjects}
                </div>
                <div className="text-sm text-gray-600">活跃项目</div>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalApplications}
                </div>
                <div className="text-sm text-gray-600">总申请数</div>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingApplications}
                </div>
                <div className="text-sm text-gray-600">待审核申请</div>
              </div>
              <FileText className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户分布 */}
      <Card>
        <CardHeader>
          <CardTitle>用户分布</CardTitle>
          <CardDescription>系统中各角色的用户数量</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">学生</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.students}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {stats.totalUsers > 0
                  ? Math.round((stats.students / stats.totalUsers) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">教师</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.teachers}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {stats.totalUsers > 0
                  ? Math.round((stats.teachers / stats.totalUsers) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">管理员</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.admins}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {stats.totalUsers > 0
                  ? Math.round((stats.admins / stats.totalUsers) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>管理功能</CardTitle>
          <CardDescription>快速访问常用管理功能</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("users")}
          >
            <UserCog className="h-8 w-8 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">用户管理</div>
              <div className="text-xs text-gray-500">管理用户和角色</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("projects")}
          >
            <FolderKanban className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <div className="font-semibold">项目管理</div>
              <div className="text-xs text-gray-500">查看所有项目</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("applications")}
          >
            <FileText className="h-8 w-8 text-yellow-600" />
            <div className="text-center">
              <div className="font-semibold">申请管理</div>
              <div className="text-xs text-gray-500">查看所有申请</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("stats")}
          >
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="text-center">
              <div className="font-semibold">系统统计</div>
              <div className="text-xs text-gray-500">查看详细统计</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* 系统概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            系统概览
          </CardTitle>
          <CardDescription>关键运营指标</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">平均项目申请数</div>
              <div className="text-2xl font-bold">
                {stats.activeProjects > 0
                  ? (stats.totalApplications / stats.activeProjects).toFixed(1)
                  : "0"}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">师生比</div>
              <div className="text-2xl font-bold">
                1:
                {stats.teachers > 0
                  ? Math.round(stats.students / stats.teachers)
                  : 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统提示 */}
      {stats.pendingApplications > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />有{" "}
              {stats.pendingApplications} 个待审核的申请
            </CardTitle>
            <CardDescription>请提醒教师及时审核学生的申请</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate("applications")}>
              查看待审核申请
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
