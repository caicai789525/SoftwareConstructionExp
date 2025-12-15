import { useState, useEffect } from "react";
import { applicationApi, projectApi } from "../../../lib/api";
import type { ApplicationView, Project } from "../../../types";
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
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState<
    ApplicationView[]
  >([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 加载我的申请
      const apps = await applicationApi.getMyApplications({
        fast: true,
        scores: false,
      });
      setRecentApplications(apps.slice(0, 5));

      setStats({
        totalApplications: apps.length,
        pending: apps.filter((a) => a.application.status === "submitted")
          .length,
        approved: apps.filter((a) => a.application.status === "approved")
          .length,
        rejected: apps.filter((a) => a.application.status === "rejected")
          .length,
      });

      // 加载项目总数
      const projects = await projectApi.getProjects({ archived: 0 });
      setTotalProjects(projects.length);
    } catch (error) {
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
        <h1 className="text-3xl font-semibold text-gray-900">学生仪表板</h1>
        <p className="text-gray-600 mt-2">
          欢迎回来！查看您的申请状态和推荐项目
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalApplications}
                </div>
                <div className="text-sm text-gray-600">总申请数</div>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600">待审核</div>
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
                  {stats.approved}
                </div>
                <div className="text-sm text-gray-600">已通过</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalProjects}
                </div>
                <div className="text-sm text-gray-600">可申请项目</div>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-400" />
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
            onClick={() => onNavigate("projects")}
          >
            <FolderKanban className="h-8 w-8 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">浏览项目</div>
              <div className="text-xs text-gray-500">查看所有可申请的项目</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("matches")}
          >
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div className="text-center">
              <div className="font-semibold">智能匹配</div>
              <div className="text-xs text-gray-500">AI 推荐最适合的项目</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => onNavigate("applications")}
          >
            <FileText className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <div className="font-semibold">我的申请</div>
              <div className="text-xs text-gray-500">查看申请状态</div>
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
                <CardDescription>查看您最近提交的申请</CardDescription>
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
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {app.project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {app.application.status === "rejected" && (
                      <span className="text-sm text-red-600">已拒绝</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 提示卡片 */}
      {stats.totalApplications === 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              开始您的科研之旅
            </CardTitle>
            <CardDescription>
              您还没有提交任何申请，立即浏览项目或使用智能匹配功能找到最适合您的项目！
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => onNavigate("projects")}>浏览项目</Button>
              <Button variant="outline" onClick={() => onNavigate("matches")}>
                <Sparkles className="h-4 w-4 mr-2" />
                智能匹配
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
