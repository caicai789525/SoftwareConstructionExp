// 数据类型定义
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  skills: string[];
}

export interface Project {
  id: number;
  teacher_id: number;
  title: string;
  description: string;
  requirements: string[];
  tags: string[];
  archived: boolean;
}

export interface Application {
  id: number;
  student_id: number;
  project_id: number;
  status: 'submitted' | 'approved' | 'rejected';
}

export interface Tracking {
  id: number;
  application_id: number;
  progress: string;
  created_at: string;
}

export interface Feedback {
  id: number;
  from_user_id: number;
  to_user_id: number;
  application_id: number;
  rating: number;
  comment: string;
}

export interface Document {
  id: number;
  application_id: number;
  name: string;
  path: string;
}

// 复合视图
export interface ApplicationView {
  application: Application;
  student: User;
  project: Project;
  score?: number;
}

export interface MatchResult {
  project: Project;
  score: number;
  reason: string;
}

// API 响应
export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}
