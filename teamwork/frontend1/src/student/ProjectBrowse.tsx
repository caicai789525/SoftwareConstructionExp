import { useState, useEffect } from 'react';
import { projectApi, applicationApi, userApi } from '../../../lib/api';
import type { Project, User } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Search, User as UserIcon, Tag, FileText, Loader2 } from 'lucide-react';
import { auth } from '../../../lib/auth';

export function ProjectBrowse() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teachers, setTeachers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const currentUser = auth.getUser();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjects({ archived: 0 });
      setProjects(data);
      const teachers = await userApi.getUsers({ role: "teacher" });
      const map = new Map<number, User>();
      for (const t of teachers) map.set(t.id, t);
      setTeachers(map);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  // const loadProjects = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await projectApi.getProjects({ archived: 0 });
  //     setProjects(data);

  //     // 加载教师信息
  //     const teacherIds = [...new Set(data.map(p => p.teacher_id))];
  //     const teacherMap = new Map<number, User>();
      
  //     await Promise.all(
  //       teacherIds.map(async (id) => {
  //         try {
  //           const teacher = await userApi.getUser(id);
  //           teacherMap.set(id, teacher);
  //         } catch (error) {
  //           console.error(`Failed to load teacher ${id}`, error);
  //         }
  //       })
  //     );
      
  //     setTeachers(teacherMap);
  //   } catch (error) {
  //     toast.error('加载项目失败');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleApply = async (projectId: number) => {
    if (!currentUser) return;
    
    setApplying(projectId);
    try {
      await applicationApi.apply({
        student_id: currentUser.id,
        project_id: projectId,
      });
      toast.success('申请提交成功！');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '申请失败');
    } finally {
      setApplying(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

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
        <h1 className="text-3xl font-semibold text-gray-900">浏览项目</h1>
        <p className="text-gray-600 mt-2">发现适合您的科研实习项目</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="搜索项目标题、描述或标签..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const teacher = teachers.get(project.teacher_id);
          return (
            <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <UserIcon className="h-4 w-4" />
                  {teacher?.name || '加载中...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
                
                {project.requirements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <FileText className="h-4 w-4" />
                      要求
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      {project.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="line-clamp-1">{req}</li>
                      ))}
                      {project.requirements.length > 3 && (
                        <li className="text-blue-600">+{project.requirements.length - 3} 更多...</li>
                      )}
                    </ul>
                  </div>
                )}

                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <Button 
                  onClick={() => handleApply(project.id)}
                  disabled={applying === project.id}
                  className="w-full mt-auto"
                >
                  {applying === project.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      申请中...
                    </>
                  ) : (
                    '申请项目'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">没有找到匹配的项目</p>
        </div>
      )}
    </div>
  );
}
