import { useState, useEffect } from "react";
import { applicationApi, trackingApi } from "../../../lib/api";
import type { ApplicationView, Tracking } from "../../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export function MyApplications() {
  const [applications, setApplications] = useState<ApplicationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationView | null>(null);
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getMyApplications({
        fast: true,
        scores: false,
      });
      setApplications(data);
    } catch (error) {
      toast.error("加载申请失败");
    } finally {
      setLoading(false);
    }
  };

  const loadTracking = async (applicationId: number) => {
    try {
      setLoadingTracking(true);
      const data = await trackingApi.getTracking(applicationId);
      setTrackings(data);
    } catch (error) {
      toast.error("加载进度失败");
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleViewDetails = async (app: ApplicationView) => {
    setSelectedApp(app);
    if (app.application.status === "approved") {
      await loadTracking(app.application.id);
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
            <CardDescription className="line-clamp-2">
              {app.project.description}
            </CardDescription>
          </div>
          {getStatusBadge(app.application.status)}
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          申请 ID: #{app.application.id}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(app)}
        >
          <Eye className="h-4 w-4 mr-2" />
          查看详情
        </Button>
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
        <h1 className="text-3xl font-semibold text-gray-900">我的申请</h1>
        <p className="text-gray-600 mt-2">查看和管理您的项目申请</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
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
                <p className="text-gray-600">您还没有提交任何申请</p>
              </CardContent>
            </Card>
          ) : (
            applications.map((app) => (
              <ApplicationCard key={app.application.id} app={app} />
            ))
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4 mt-6">
          {filterApplications("submitted").map((app) => (
            <ApplicationCard key={app.application.id} app={app} />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {filterApplications("approved").map((app) => (
            <ApplicationCard key={app.application.id} app={app} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {filterApplications("rejected").map((app) => (
            <ApplicationCard key={app.application.id} app={app} />
          ))}
        </TabsContent>
      </Tabs>

      {/* 详情对话框 */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedApp?.project.title}</DialogTitle>
            <DialogDescription>申请详情</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">状态</h3>
                {selectedApp && getStatusBadge(selectedApp.application.status)}
              </div>

              <div>
                <h3 className="font-semibold mb-2">项目描述</h3>
                <p className="text-sm text-gray-600">
                  {selectedApp?.project.description}
                </p>
              </div>

              {selectedApp?.project.requirements &&
                selectedApp.project.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">项目要求</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      {selectedApp.project.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedApp?.project.tags &&
                selectedApp.project.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {selectedApp?.application.status === "approved" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">进度跟踪</h3>
                  </div>
                  {loadingTracking ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : trackings.length > 0 ? (
                    <div className="space-y-3">
                      {trackings.map((tracking, idx) => (
                        <div key={tracking.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </div>
                            {idx < trackings.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium">
                              {tracking.progress}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(tracking.created_at).toLocaleString(
                                "zh-CN"
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      暂无进度记录
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
