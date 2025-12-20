// 管理员用户管理组件
class AdminUserManagement {
  constructor() {
    this.users = [];
  }
  
  fetchUsers() {
    // 获取所有用户
    this.users = [
      { id: 1, username: 'user1', role: 'student' },
      { id: 2, username: 'user2', role: 'teacher' },
      { id: 3, username: 'admin1', role: 'admin' }
    ];
  }
  
  addUser(userInfo) {
    // 添加用户
    const newUser = { id: this.users.length + 1, ...userInfo };
    this.users.push(newUser);
    return newUser;
  }
  
  deleteUser(userId) {
    // 删除用户
    this.users = this.users.filter(user => user.id !== userId);
  }
  
  render() {
    // 渲染用户管理界面
    return `
      <div class="admin-user-management">
        <h2>用户管理</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.users.map(user => `
              <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                  <button onclick="editUser(${user.id})">编辑</button>
                  <button onclick="deleteUser(${user.id})">删除</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}
