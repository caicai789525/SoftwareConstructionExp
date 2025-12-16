import { useState, useEffect } from 'react';
import { userApi, adminApi } from '../../../lib/api';
import type { User } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Loader2, 
  Search, 
  UserCog,
  Users as UsersIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success('用户角色更新成功');
      loadUsers();
    } catch (error) {
      toast.error('更新角色失败');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <Badge variant="secondary">学生</Badge>;
      case 'teacher':
        return <Badge className="bg-blue-500">教师</Badge>;
      case 'admin':
        return <Badge className="bg-purple-500">管理员</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const filterByRole = (role?: string) => {
    if (!role) return filteredUsers;
    return filteredUsers.filter(user => user.role === role);
  };

  const students = filterByRole('student');
  const teachers = filterByRole('teacher');
  const admins = filterByRole('admin');

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
        <h1 className="text-3xl font-semibold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-2">管理系统中的所有用户和角色</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                <div className="text-sm text-gray-600">学生</div>
              </div>
              <UsersIcon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{teachers.length}</div>
                <div className="text-sm text-gray-600">教师</div>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
                <div className="text-sm text-gray-600">管理员</div>
              </div>
              <UsersIcon className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="搜索用户名、邮箱或角色..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">全部 ({filteredUsers.length})</TabsTrigger>
              <TabsTrigger value="student">学生 ({students.length})</TabsTrigger>
              <TabsTrigger value="teacher">教师 ({teachers.length})</TabsTrigger>
              <TabsTrigger value="admin">管理员 ({admins.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <UserTable users={filteredUsers} onUpdateRole={handleUpdateRole} updatingUserId={updatingUserId} getRoleBadge={getRoleBadge} />
            </TabsContent>

            <TabsContent value="student" className="mt-4">
              <UserTable users={students} onUpdateRole={handleUpdateRole} updatingUserId={updatingUserId} getRoleBadge={getRoleBadge} />
            </TabsContent>

            <TabsContent value="teacher" className="mt-4">
              <UserTable users={teachers} onUpdateRole={handleUpdateRole} updatingUserId={updatingUserId} getRoleBadge={getRoleBadge} />
            </TabsContent>

            <TabsContent value="admin" className="mt-4">
              <UserTable users={admins} onUpdateRole={handleUpdateRole} updatingUserId={updatingUserId} getRoleBadge={getRoleBadge} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface UserTableProps {
  users: User[];
  onUpdateRole: (userId: number, role: string) => void;
  updatingUserId: number | null;
  getRoleBadge: (role: string) => React.ReactNode;
}

function UserTable({ users, onUpdateRole, updatingUserId, getRoleBadge }: UserTableProps) {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
  };

  const handleSaveRole = (userId: number) => {
    onUpdateRole(userId, selectedRole);
    setEditingUserId(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole('');
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">没有找到匹配的用户</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>技能</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-mono text-sm">{user.id}</TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {editingUserId === user.id ? (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">学生</SelectItem>
                      <SelectItem value="teacher">教师</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getRoleBadge(user.role)
                )}
              </TableCell>
              <TableCell>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">无</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingUserId === user.id ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveRole(user.id)}
                      disabled={updatingUserId === user.id}
                    >
                      {updatingUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        '保存'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updatingUserId === user.id}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartEdit(user)}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    修改角色
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
