import { useState, useEffect } from "react";
import { applicationApi, trackingApi, feedbackApi } from "../../../lib/api";
import { auth } from "../../../lib/auth";
import type { ApplicationView } from "../../../types";
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
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Star,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export function ApplicationReview() {
  const [applications, setApplications] = useState<ApplicationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationView | null>(null);
  const [processing, setProcessing] = useState(false);

  // 反馈表单
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const currentUser = auth.getUser();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getApplications({
        fast: true,
        page_size: 50,
      });
      if (currentUser && currentUser.role === "teacher") {
        const myApplications = data.filter(
          (app) => app.project.teacher_id === currentUser.id
        );
        setApplications(myApplications);
      } else {
        setApplications(data);
      }
    } catch (error) {
      toast.error("加载申请失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: number, status: string) => {
    setProcessing(true);
    try {
      await applicationApi.updateStatus(applicationId, status);
      toast.success(`已${status === "approved" ? "通过" : "拒绝"}申请`);
      loadApplications();
      setSelectedApp(null);
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddProgress = async () => {
    if (!selectedApp) return;

    const progress = prompt("请输入进度更新：");
    if (!progress) return;

    try {
      await trackingApi.addTracking({
        application_id: selectedApp.application.id,
        progress,
      });
      toast.success("进度更新成功");
    } catch (error) {
      toast.error("进度更新失败");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !currentUser) return;

    setSubmittingFeedback(true);
    try {
      await feedbackApi.createFeedback({
        from_user_id: currentUser.id,
        to_user_id: selectedApp.student.id,
        application_id: selectedApp.application.id,
        rating,
        comment,
      });
      toast.success("反馈提交成功");
      setShowFeedbackDialog(false);
      setRating(5);
      setComment("");
    } catch (error) {
      toast.error("反馈提交失败");
    } finally {
      setSubmittingFeedback(false);
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
            <p className="text-sm font-medium mb-2">学生技能：</p>
            <div className="flex flex-wrap gap-2">
              {app.student.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedApp(app)}
          >
            <Eye className="h-4 w-4 mr-2" />
            查看详情
          </Button>

          {app.application.status === "submitted" && (
            <>
              <Button
                size="sm"
                onClick={() =>
                  handleUpdateStatus(app.application.id, "approved")
                }
                disabled={processing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                通过
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  handleUpdateStatus(app.application.id, "rejected")
                }
                disabled={processing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                拒绝
              </Button>
            </>
          )}
        </div>
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
        <h1 className="text-3xl font-semibold text-gray-900">申请审批</h1>
        <p className="text-gray-600 mt-2">审核和管理学生的项目申请</p>
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

      {/* 详情对话框 */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>申请详情</DialogTitle>
            <DialogDescription>{selectedApp?.project.title}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">状态</h3>
                {selectedApp && getStatusBadge(selectedApp.application.status)}
              </div>

              <div>
                <h3 className="font-semibold mb-2">申请人信息</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <strong>姓名:</strong> {selectedApp?.student.name}
                  </p>
                  <p className="text-sm">
                    <strong>邮箱:</strong> {selectedApp?.student.email}
                  </p>
                  {selectedApp?.student.skills &&
                    selectedApp.student.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">技能标签:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.student.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {selectedApp?.score !== undefined && (
                <div>
                  <h3 className="font-semibold mb-2">匹配分数</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round(selectedApp.score * 100)}%
                    </p>
                  </div>
                </div>
              )}

              {selectedApp?.application.status === "submitted" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedApp.application.id, "approved")
                    }
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    通过申请
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleUpdateStatus(selectedApp.application.id, "rejected")
                    }
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    拒绝申请
                  </Button>
                </div>
              )}

              {selectedApp?.application.status === "approved" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleAddProgress}
                    variant="outline"
                    className="flex-1"
                  >
                    添加进度
                  </Button>
                  <Button
                    onClick={() => setShowFeedbackDialog(true)}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    提供反馈
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 反馈对话框 */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提供反馈</DialogTitle>
            <DialogDescription>
              为 {selectedApp?.student.name} 提供评价和反馈
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">评分 (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">评价内容</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="输入您的评价和建议..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submittingFeedback}
                className="flex-1"
              >
                {submittingFeedback ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交反馈"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
