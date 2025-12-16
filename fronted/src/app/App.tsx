import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { auth } from '../lib/auth';
import type { User } from '../types';

// 认证页面
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';

// 布局
import { DashboardLayout } from './components/layout/DashboardLayout';

// 学生组件
import { StudentDashboard } from './components/student/StudentDashboard';
import { ProjectBrowse } from './components/student/ProjectBrowse';
import { SmartMatch } from './components/student/SmartMatch';
import { MyApplications } from './components/student/MyApplications';

// 教师组件
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ProjectManagement } from './components/teacher/ProjectManagement';
import { ApplicationReview } from './components/teacher/ApplicationReview';

// 管理员组件
import { UserManagement } from './components/admin/UserManagement';
import { SystemStats } from './components/admin/SystemStats';
import { AdminDashboard } from './components/admin/AdminDashboard';

// 通用组件
import { Settings } from './components/common/Settings';
import { ProgressTracking } from './components/common/ProgressTracking';

type AuthView = 'login' | 'register';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 检查是否已登录
    const token = auth.getToken();
    const savedUser = auth.getUser();
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(savedUser);
    }
  }, []);

  const handleLoginSuccess = () => {
    const savedUser = auth.getUser();
    setUser(savedUser);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('dashboard');
    setAuthView('login');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  // 未登录时显示认证页面
  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        ) : (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  // 根据用户角色渲染不同的内容
  const renderContent = () => {
    if (!user) return null;

    // 学生视图
    if (user.role === 'student') {
      switch (currentView) {
        case 'dashboard':
          return <StudentDashboard onNavigate={handleViewChange} />;
        case 'projects':
          return <ProjectBrowse />;
        case 'matches':
          return <SmartMatch />;
        case 'applications':
          return <MyApplications />;
        case 'progress':
          return <ProgressTracking />;
        case 'settings':
          return <Settings />;
        default:
          return <StudentDashboard onNavigate={handleViewChange} />;
      }
    }

    // 教师视图
    if (user.role === 'teacher') {
      switch (currentView) {
        case 'dashboard':
          return <TeacherDashboard onNavigate={handleViewChange} />;
        case 'my-projects':
          return <ProjectManagement />;
        case 'applications':
          return <ApplicationReview />;
        case 'progress':
          return <ProgressTracking />;
        case 'feedback':
          return <ApplicationReview />;
        case 'settings':
          return <Settings />;
        default:
          return <TeacherDashboard onNavigate={handleViewChange} />;
      }
    }

    // 管理员视图
    if (user.role === 'admin') {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboard onNavigate={handleViewChange} />;
        case 'users':
          return <UserManagement />;
        case 'projects':
          return <ProjectManagement />;
        case 'applications':
          return <ApplicationReview />;
        case 'stats':
          return <SystemStats />;
        case 'settings':
          return <Settings />;
        default:
          return <AdminDashboard onNavigate={handleViewChange} />;
      }
    }

    return null;
  };

  return (
    <>
      <DashboardLayout
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      >
        {renderContent()}
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
}