import { useEffect, useState } from "react";
import { projectApi } from "../../../lib/api";
import type { Project } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Loader2, FolderKanban, Archive } from "lucide-react";
import { toast } from "sonner";

export function AdminProjectList() {
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [act, arc] = await Promise.all([
        projectApi.getProjects({ archived: 0 }),
        projectApi.getProjects({ archived: 1 }),
      ]);
      setActiveProjects(Array.isArray(act) ? act : []);
      setArchivedProjects(Array.isArray(arc) ? arc : []);
    } catch {
      toast.error("加载项目失败");
      setActiveProjects([]);
      setArchivedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const ProjectCard = ({ p }: { p: Project }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{p.title}</CardTitle>
        <CardDescription className="line-clamp-2">{p.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4" />
          <span className="text-sm text-gray-600">教师ID: {p.teacher_id}</span>
        </div>
        {p.tags && p.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.tags.slice(0, 5).map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
            {p.tags.length > 5 && (
              <Badge variant="outline">+{p.tags.length - 5}</Badge>
            )}
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
        <h1 className="text-3xl font-semibold text-gray-900">项目总览</h1>
        <p className="text-gray-600 mt-2">管理员只读视图</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">活跃项目 ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="archived">已归档 ({archivedProjects.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4 mt-6">
          {activeProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderKanban className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">暂无活跃项目</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeProjects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          {archivedProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">暂无归档项目</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {archivedProjects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
