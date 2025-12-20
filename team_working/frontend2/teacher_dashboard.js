// 教师仪表盘组件
class TeacherDashboard {
  constructor() {
    this.projects = [];
    this.applications = [];
  }
  
  fetchProjects() {
    // 获取教师发布的项目
    this.projects = [{ id: 1, name: '项目1', status: '招募中' }, { id: 2, name: '项目2', status: '已结束' }];
  }
  
  fetchApplications() {
    // 获取学生申请
    this.applications = [{ id: 1, studentName: '学生A', projectId: 1, status: '待审核' }];
  }
  
  render() {
    // 渲染教师仪表盘
    return `
      <div class="teacher-dashboard">
        <h2>教师仪表盘</h2>
        <div class="projects-section">
          <h3>我的项目</h3>
          ${this.projects.map(p => `<div>${p.name} - ${p.status}</div>`).join('')}
        </div>
        <div class="applications-section">
          <h3>学生申请</h3>
          ${this.applications.map(a => `<div>${a.studentName} - ${a.status}</div>`).join('')}
        </div>
      </div>
    `;
  }
}
