import { useState, useEffect } from "react";
import { projectApi, userApi } from "../../../lib/api";
import { auth } from "../../../lib/auth";
import type { Project } from "../../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const currentUser = auth.getUser();

  // 表单状态
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  // const loadProjects = async () => {
  //   if (!currentUser) return;

  //   try {
  //     setLoading(true);
  //     const data = await projectApi.getProjects({ teacher_id: currentUser.id });
  //     setProjects(data);
  //   } catch (error) {
  //     toast.error('加载项目失败');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const loadProjects = async () => {
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
      const [active, archived] = await Promise.all([
        projectApi.getProjects({ teacher_id: user.id }),
        projectApi.getProjects({ teacher_id: user.id, archived: 1 }),
      ]);
      const act = Array.isArray(active) ? active : [];
      const arc = Array.isArray(archived) ? archived : [];
      setProjects([...act, ...arc]);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRequirements([]);
    setCurrentRequirement("");
    setTags([]);
    setCurrentTag("");
    setEditingProject(null);
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setTitle(project.title);
      setDescription(project.description);
      setRequirements(project.requirements);
      setTags(project.tags);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleAddRequirement = () => {
    if (
      currentRequirement.trim() &&
      !requirements.includes(currentRequirement.trim())
    ) {
      setRequirements([...requirements, currentRequirement.trim()]);
      setCurrentRequirement("");
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    try {
      const projectData = {
        teacher_id: currentUser.id,
        title,
        description,
        requirements,
        tags,
        archived: false,
      };

      if (editingProject) {
        await projectApi.updateProject({
          ...projectData,
          id: editingProject.id,
        });
        toast.success("项目更新成功！");
      } else {
        await projectApi.createProject(projectData);
        toast.success("项目创建成功！");
      }

      setDialogOpen(false);
      resetForm();
      loadProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (project: Project) => {
    try {
      await projectApi.archiveProject(project.id, !project.archived);
      toast.success(project.archived ? "项目已恢复" : "项目已归档");
      loadProjects();
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm("确定要删除这个项目吗？此操作无法撤销。")) return;

    try {
      await projectApi.deleteProject(projectId);
      toast.success("项目已删除");
      loadProjects();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">我的项目</h1>
          <p className="text-gray-600 mt-2">管理您发布的科研实习项目</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              发布新项目
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "编辑项目" : "发布新项目"}
              </DialogTitle>
              <DialogDescription>
                填写项目信息以发布新的科研实习项目
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">项目标题 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入项目标题"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">项目描述 *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="详细描述项目内容、目标和预期成果"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">项目要求</Label>
                <div className="flex gap-2">
                  <Input
                    id="requirements"
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    placeholder="输入要求后按回车或点击添加"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddRequirement}
                    variant="outline"
                  >
                    添加
                  </Button>
                </div>
                {requirements.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="flex-1 text-sm">{req}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRequirement(req)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="输入标签后按回车或点击添加"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                  >
                    添加
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingProject ? "更新中..." : "发布中..."}
                    </>
                  ) : editingProject ? (
                    "更新项目"
                  ) : (
                    "发布项目"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            活跃项目 ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            已归档 ({archivedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">您还没有发布任何项目</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  发布第一个项目
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(project)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(project)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        归档
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          {archivedProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">没有已归档的项目</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivedProjects.map((project) => (
                <Card key={project.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(project)}
                      >
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        恢复
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
