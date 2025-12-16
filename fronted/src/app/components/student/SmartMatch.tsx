import { useState } from 'react';
import { matchApi, applicationApi } from '../../../lib/api';
import type { MatchResult } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { Sparkles, Target, TrendingUp, Loader2, Tag, FileText } from 'lucide-react';
import { auth } from '../../../lib/auth';

export function SmartMatch() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const currentUser = auth.getUser();

  const handleMatch = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const results = await matchApi.getMatches({
        student_id: currentUser.id,
        fast: true,
        top_k: 10,
      });
      setMatches(results);
      toast.success(`找到 ${results.length} 个匹配项目！`);
    } catch (error) {
      toast.error('智能匹配失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

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

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return '高度匹配';
    if (score >= 0.6) return '较好匹配';
    if (score >= 0.4) return '一般匹配';
    return '低度匹配';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">智能匹配</h1>
        <p className="text-gray-600 mt-2">基于您的技能和兴趣，为您推荐最适合的项目</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <CardTitle>AI 智能推荐</CardTitle>
          </div>
          <CardDescription>
            我们会根据您的技能标签和项目要求进行智能匹配分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser?.skills && currentUser.skills.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">您的技能标签：</p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                onClick={handleMatch} 
                disabled={loading}
                size="lg"
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    开始智能匹配
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">请先在设置中添加您的技能标签</p>
              <Button variant="outline">前往设置</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">匹配结果</h2>
            <Badge variant="secondary" className="ml-auto">
              共 {matches.length} 个项目
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {matches.map((match, index) => {
              const scorePercent = Math.round(match.score * 100);
              return (
                <Card 
                  key={match.project.id} 
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                            #{index + 1}
                          </span>
                          <CardTitle className="text-xl">{match.project.title}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {match.project.description}
                        </CardDescription>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-2xl font-bold ${getScoreColor(match.score)}`}>
                          {scorePercent}%
                        </div>
                        <div className="text-xs text-gray-500">{getScoreLabel(match.score)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Progress value={scorePercent} className="h-2" />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        匹配原因
                      </p>
                      <p className="text-sm text-gray-700">{match.reason}</p>
                    </div>

                    {match.project.requirements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <FileText className="h-4 w-4" />
                          项目要求
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                          {match.project.requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                          {match.project.requirements.length > 3 && (
                            <li className="text-blue-600">+{match.project.requirements.length - 3} 更多...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {match.project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {match.project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button 
                      onClick={() => handleApply(match.project.id)}
                      disabled={applying === match.project.id}
                      className="w-full"
                    >
                      {applying === match.project.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          申请中...
                        </>
                      ) : (
                        '申请此项目'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!loading && matches.length === 0 && currentUser?.skills && currentUser.skills.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">点击上方按钮开始智能匹配</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
