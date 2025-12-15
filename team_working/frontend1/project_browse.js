// 学生端项目浏览组件
class ProjectBrowse {
  constructor() {
    this.projects = [];
  }
  
  fetchProjects() {
    // 获取项目列表
    this.projects = [{ id: 1, name: '项目1' }, { id: 2, name: '项目2' }];
  }
  
  render() {
    // 渲染项目列表
    return this.projects.map(project => `<div>${project.name}</div>`);
  }
}
