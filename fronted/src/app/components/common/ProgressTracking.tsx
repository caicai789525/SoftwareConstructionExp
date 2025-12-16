import { useState, useEffect } from 'react';
import { applicationApi, trackingApi } from '../../../lib/api';
import { auth } from '../../../lib/auth';
import type { ApplicationView, Tracking } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, TrendingUp, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ProgressTracking() {
  const [applications, setApplications] = useState<ApplicationView[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationView | null>(null);
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProgress, setNewProgress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentUser = auth.getUser();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      let apps: ApplicationView[];

      if (currentUser.role === 'student') {
        apps = await applicationApi.getMyApplications({ status: 'approved' });
      } else {
        const allApps = await applicationApi.getApplications({ 
          status: 'approved',
          fast: true 
        });
        // 教师和管理员可以看到自己项目的申请
        if (currentUser.role === 'teacher') {
          apps = allApps.filter(app => app.project.teacher_id === currentUser.id);
        } else {
          apps = allApps;
        }
      }

      setApplications(apps);
    } catch (error) {
      toast.error('加载申请失败');
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
      toast.error('加载进度失败');
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleViewProgress = async (app: ApplicationView) => {
    setSelectedApp(app);
    await loadTracking(app.application.id);
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newProgress.trim()) return;

    setSubmitting(true);
    try {
      await trackingApi.addTracking({
        application_id: selectedApp.application.id,
        progress: newProgress.trim(),
      });
      toast.success('进度添加成功');
      setNewProgress('');
      setShowAddDialog(false);
      await loadTracking(selectedApp.application.id);
    } catch (error) {
      toast.error('添加进度失败');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-semibold text-gray-900">进度跟踪</h1>
        <p className="text-gray-600 mt-2">查看和管理项目进度</p>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">暂无已通过的申请</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{app.project.title}</CardTitle>
                <CardDescription>
                  {currentUser?.role === 'student' 
                    ? `申请 ID: #${app.application.id}`
                    : `学生: ${app.student.name}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">状态:</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    已通过
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewProgress(app)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  查看进度
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 进度详情对话框 */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedApp?.project.title}</DialogTitle>
            <DialogDescription>项目进度跟踪</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {currentUser?.role === 'student' 
                      ? `申请 ID: #${selectedApp?.application.id}`
                      : `学生: ${selectedApp?.student.name}`
                    }
                  </p>
                </div>
                {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                  <Button onClick={() => setShowAddDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    添加进度
                  </Button>
                )}
              </div>

              {loadingTracking ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : trackings.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    进度时间线
                  </h3>
                  <div className="space-y-4">
                    {trackings.map((tracking, idx) => (
                      <div key={tracking.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            {idx + 1}
                          </div>
                          {idx < trackings.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-[40px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{tracking.progress}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(tracking.created_at).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">暂无进度记录</p>
                  {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加第一条进度
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 添加进度对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加进度</DialogTitle>
            <DialogDescription>
              为 {selectedApp?.project.title} 添加新的进度记录
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddProgress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="progress">进度描述</Label>
              <Input
                id="progress"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                placeholder="输入进度描述..."
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    添加中...
                  </>
                ) : (
                  '添加进度'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setNewProgress('');
                }}
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
