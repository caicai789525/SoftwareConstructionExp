import { useState, useEffect } from 'react';
import { userApi, projectApi, applicationApi, adminApi } from '../../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Users, FolderKanban, FileText, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SystemStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    totalProjects: 0,
    activeProjects: 0,
    archivedProjects: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 加载用户统计
      const users = await userApi.getUsers();
      const students = users.filter(u => u.role === 'student');
      const teachers = users.filter(u => u.role === 'teacher');
      const admins = users.filter(u => u.role === 'admin');

      // 加载项目统计
      const allProjects = await projectApi.getProjects();
      const activeProjects = allProjects.filter(p => !p.archived);
      const archivedProjects = allProjects.filter(p => p.archived);

      // 加载申请统计
      const applications = await applicationApi.getApplications({ fast: true });
      const pendingApps = applications.filter(a => a.application.status === 'submitted');
      const approvedApps = applications.filter(a => a.application.status === 'approved');
      const rejectedApps = applications.filter(a => a.application.status === 'rejected');

      setStats({
        totalUsers: users.length,
        students: students.length,
        teachers: teachers.length,
        admins: admins.length,
        totalProjects: allProjects.length,
        activeProjects: activeProjects.length,
        archivedProjects: archivedProjects.length,
        totalApplications: applications.length,
        pendingApplications: pendingApps.length,
        approvedApplications: approvedApps.length,
        rejectedApplications: rejectedApps.length,
      });

      // 尝试加载后端统计（可选）
      try {
        const backendStats = await adminApi.getStats();
        console.log('Backend stats:', backendStats);
      } catch (error) {
        // 忽略错误，使用前端统计
      }
    } catch (error) {
      toast.error('加载统计数据失败');
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

  const approvalRate = stats.totalApplications > 0 
    ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">系统统计</h1>
        <p className="text-gray-600 mt-2">查看系统的整体运行情况和数据统计</p>
      </div>

      {/* 用户统计 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          用户统计
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>总用户数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>学生</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">{stats.students}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalUsers > 0 ? Math.round((stats.students / stats.totalUsers) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>教师</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">{stats.teachers}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalUsers > 0 ? Math.round((stats.teachers / stats.totalUsers) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>管理员</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-purple-600">{stats.admins}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalUsers > 0 ? Math.round((stats.admins / stats.totalUsers) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 项目统计 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          项目统计
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>总项目数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
                <FolderKanban className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>活跃项目</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">{stats.activeProjects}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>已归档</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-600">{stats.archivedProjects}</div>
                <div className="text-sm text-gray-500">
                  {stats.totalProjects > 0 ? Math.round((stats.archivedProjects / stats.totalProjects) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 申请统计 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          申请统计
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>总申请数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stats.totalApplications}</div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>待审核</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>已通过</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">{stats.approvedApplications}</div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>已拒绝</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">{stats.rejectedApplications}</div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 关键指标 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          关键指标
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>申请通过率</CardTitle>
              <CardDescription>已通过的申请占总申请的比例</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{approvalRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>平均项目申请数</CardTitle>
              <CardDescription>每个项目平均收到的申请数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {stats.activeProjects > 0 
                  ? (stats.totalApplications / stats.activeProjects).toFixed(1)
                  : '0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>师生比</CardTitle>
              <CardDescription>教师与学生的比例</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                1:{stats.teachers > 0 ? Math.round(stats.students / stats.teachers) : 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 系统健康度 */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            系统健康度
          </CardTitle>
          <CardDescription>系统运行状态良好</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">用户活跃度</span>
            <span className="text-sm font-medium text-green-600">良好</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">项目发布率</span>
            <span className="text-sm font-medium text-green-600">正常</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">申请响应速度</span>
            <span className="text-sm font-medium text-green-600">快速</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
