import { useState, useEffect } from "react";
import { projectApi, applicationApi, userApi } from "../../../lib/api";
import { auth } from "../../../lib/auth";
import type { Project, ApplicationView } from "../../../types";
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
  FolderKanban,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface TeacherDashboardProps {
  onNavigate: (view: string) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState<
    ApplicationView[]
  >([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.getUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!currentUser || currentUser.role !== "teacher") {
      setLoading(false);
      return;
    }
    let user = currentUser;
    if (!user) {
      const token = auth.getToken();
      if (token) {
        try {
          user = await userApi.getMe();
          auth.setUser(user);
        } catch {
          setLoading(false);
          return;
        }
      } else {
        setLoading(false);
        return;
      }
    }
    try {
      setLoading(true);
      const projects = await projectApi.getProjects({ teacher_id: user.id });
      const activeProjects = projects.filter((p) => !p.archived);
      const allApps = await applicationApi.getApplications({ fast: true });
      const myApps = allApps.filter(
        (app) => app.project.teacher_id === user.id
      );
      setRecentApplications(myApps.slice(0, 5));
      setStats({
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalApplications: myApps.length,
        pendingApplications: myApps.filter(
          (a) => a.application.status === "submitted"
        ).length,
        approvedApplications: myApps.filter(
          (a) => a.application.status === "approved"
        ).length,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };
  // const loadDashboardData = async () => {
  //   if (!currentUser) return;

  //   try {
  //     setLoading(true);

  //     // 加载我的项目
  //     const projects = await projectApi.getProjects({
  //       teacher_id: currentUser.id,
  //     });
  //     const activeProjects = projects.filter((p) => !p.archived);

  //     // 加载申请
  //     const allApps = await applicationApi.getApplications({ fast: true });
  //     const myApps = allApps.filter(
  //       (app) => app.project.teacher_id === currentUser.id
  //     );

  //     setRecentApplications(myApps.slice(0, 5));

  //     setStats({
  //       totalProjects: projects.length,
  //       activeProjects: activeProjects.length,
  //       totalApplications: myApps.length,
  //       pendingApplications: myApps.filter(
  //         (a) => a.application.status === "submitted"
  //       ).length,
  //       approvedApplications: myApps.filter(
  //         (a) => a.application.status === "approved"
  //       ).length,
  //     });
  //   } catch (error) {
  //     toast.error("加载数据失败");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        <h1 className="text-3xl font-semibold text-gray-900">教师仪表板</h1>
        <p className="text-gray-600 mt-2">欢迎回来！查看您的项目和申请状态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalProjects}
                </div>
                <div className="text-sm text-gray-600">总项目数</div>
              </div>
              <FolderKanban className="h-8 w-8 text-gray-400" />
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
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingApplications}
                </div>
                <div className="text-sm text-gray-600">待审核申请</div>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.approvedApplications}
                </div>
                <div className="text-sm text-gray-600">已通过申请</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>快速访问常用功能</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("my-projects")}
          >
            <FolderKanban className="h-8 w-8 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">管理项目</div>
              <div className="text-xs text-gray-500">发布和管理您的项目</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("applications")}
          >
            <FileText className="h-8 w-8 text-yellow-600" />
            <div className="text-center">
              <div className="font-semibold">审批申请</div>
              <div className="text-xs text-gray-500">审核学生的项目申请</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("progress")}
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <div className="font-semibold">进度跟踪</div>
              <div className="text-xs text-gray-500">跟踪项目进度</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* 最近的申请 */}
      {recentApplications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近的申请</CardTitle>
                <CardDescription>查看最近收到的申请</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("applications")}
              >
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.application.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{app.project.title}</h4>
                    <p className="text-sm text-gray-500">
                      申请人: {app.student.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.application.status === "submitted" && (
                      <span className="text-sm text-yellow-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        待审核
                      </span>
                    )}
                    {app.application.status === "approved" && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        已通过
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate("applications")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 提示卡片 */}
      {stats.totalProjects === 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              开始发布您的第一个项目
            </CardTitle>
            <CardDescription>
              发布科研实习项目，招募优秀的学生加入您的团队！
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate("my-projects")}>
              <Plus className="h-4 w-4 mr-2" />
              发布项目
            </Button>
          </CardContent>
        </Card>
      )}

      {stats.pendingApplications > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              您有 {stats.pendingApplications} 个待审核的申请
            </CardTitle>
            <CardDescription>
              请及时审核学生的申请，帮助他们更快地加入项目
            </CardDescription>
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
