import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { authApi } from "../../../lib/api";
import { auth } from "../../../lib/auth";
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginPage({
  onLoginSuccess,
  onSwitchToRegister,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      auth.setToken(response.token);

      // 获取用户信息
      const { userApi } = await import("../../../lib/api");
      const user = await userApi.getMe();
      auth.setUser(user);

      toast.success("登录成功！");
      onLoginSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "登录失败，请检查邮箱和密码"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">科研实习管理系统</CardTitle>
          <CardDescription className="text-center">
            登录您的账户以继续
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="text"
                //placeholder="your@email.com"
                placeholder="账号或邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                //required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                //required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            还没有账户？{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:underline"
            >
              立即注册
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
