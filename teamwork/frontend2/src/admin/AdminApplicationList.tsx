import { useEffect, useState } from "react";
import { applicationApi } from "../../../lib/api";
import type { ApplicationView } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Loader2, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { toast } from "sonner";

export function AdminApplicationList() {
  const [applications, setApplications] = useState<ApplicationView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getApplications({ fast: true, page_size: 100 });
      setApplications(data);
    } catch {
      toast.error("加载申请失败");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            待审核
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle className="h-3 w-3" />
            已通过
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            已拒绝
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filterApplications = (status?: string) => {
    if (!status) return applications;
    return applications.filter((app) => app.application.status === status);
  };

  const ApplicationCard = ({ app }: { app: ApplicationView }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{app.project.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              申请人: {app.student.name}
            </CardDescription>
          </div>
          {getStatusBadge(app.application.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {app.student.skills && app.student.skills.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">学生技能</p>
            <div className="flex flex-wrap gap-2">
              {app.student.skills.slice(0, 5).map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {app.score !== undefined && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium">匹配分数</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(app.score * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
        <h1 className="text-3xl font-semibold text-gray-900">申请总览</h1>
        <p className="text-gray-600 mt-2">管理员只读视图</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {applications.length}
            </div>
            <div className="text-sm text-gray-600">总申请数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filterApplications("submitted").length}
            </div>
            <div className="text-sm text-gray-600">待审核</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filterApplications("approved").length}
            </div>
            <div className="text-sm text-gray-600">已通过</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部 ({applications.length})</TabsTrigger>
          <TabsTrigger value="submitted">
            待审核 ({filterApplications("submitted").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            已通过 ({filterApplications("approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            已拒绝 ({filterApplications("rejected").length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-6">
          {applications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">暂无申请</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <ApplicationCard key={app.application.id} app={app} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="submitted" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterApplications("submitted").map((app) => (
              <ApplicationCard key={app.application.id} app={app} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="approved" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterApplications("approved").map((app) => (
              <ApplicationCard key={app.application.id} app={app} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterApplications("rejected").map((app) => (
              <ApplicationCard key={app.application.id} app={app} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
