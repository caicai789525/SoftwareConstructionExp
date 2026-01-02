// 管理员相关功能模块
package admin

import (
	"gorm.io/gorm"
)

// 用户模型
type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Username  string `gorm:"unique;not null" json:"username"`
	Password  string `gorm:"not null" json:"-"`
	Role      string `gorm:"not null" json:"role"` // student, teacher, admin
	CreatedAt string `gorm:"not null" json:"created_at"`
	UpdatedAt string `gorm:"not null" json:"updated_at"`
}

// 申请模型
type Application struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	StudentID    uint   `gorm:"not null" json:"student_id"`
	ProjectID    uint   `gorm:"not null" json:"project_id"`
	Status       string `gorm:"not null" json:"status"` // pending, approved, rejected
	ApplyTime    string `gorm:"not null" json:"apply_time"`
	ApproveTime  string `json:"approve_time"`
	TeacherID    uint   `json:"teacher_id"`
}

// 管理员仓库接口
type AdminRepository interface {
	// 用户管理
	CreateUser(user *User) error
	GetUserByID(id uint) (*User, error)
	GetUserByUsername(username string) (*User, error)
	UpdateUser(user *User) error
	DeleteUser(id uint) error
	GetAllUsers() ([]User, error)
	GetUsersByRole(role string) ([]User, error)
	
	// 系统统计
	GetSystemStats() (SystemStats, error)
}

// 系统统计数据结构
type SystemStats struct {
	TotalUsers    int `json:"total_users"`
	StudentCount  int `json:"student_count"`
	TeacherCount  int `json:"teacher_count"`
	AdminCount    int `json:"admin_count"`
	TotalProjects int `json:"total_projects"`
	RecruitingProjects int `json:"recruiting_projects"`
	TotalApplications int `json:"total_applications"`
	PendingApplications int `json:"pending_applications"`
}

// 管理员仓库实现
type adminRepository struct {
	db *gorm.DB
}

// 创建管理员仓库实例
func NewAdminRepository(db *gorm.DB) AdminRepository {
	return &adminRepository{db: db}
}

// 创建用户
func (r *adminRepository) CreateUser(user *User) error {
	return r.db.Create(user).Error
}

// 根据ID获取用户
func (r *adminRepository) GetUserByID(id uint) (*User, error) {
	var user User
	result := r.db.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// 根据用户名获取用户
func (r *adminRepository) GetUserByUsername(username string) (*User, error) {
	var user User
	result := r.db.Where("username = ?", username).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// 更新用户
func (r *adminRepository) UpdateUser(user *User) error {
	return r.db.Save(user).Error
}

// 删除用户
func (r *adminRepository) DeleteUser(id uint) error {
	return r.db.Delete(&User{}, id).Error
}

// 获取所有用户
func (r *adminRepository) GetAllUsers() ([]User, error) {
	var users []User
	result := r.db.Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

// 根据角色获取用户
func (r *adminRepository) GetUsersByRole(role string) ([]User, error) {
	var users []User
	result := r.db.Where("role = ?", role).Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

// 获取系统统计信息
func (r *adminRepository) GetSystemStats() (SystemStats, error) {
	var stats SystemStats
	
	// 总用户数
	var totalUsers int64
	if err := r.db.Model(&User{}).Count(&totalUsers).Error; err != nil {
		return stats, err
	}
	stats.TotalUsers = int(totalUsers)
	
	// 学生数
	var studentCount int64
	if err := r.db.Model(&User{}).Where("role = ?", "student").Count(&studentCount).Error; err != nil {
		return stats, err
	}
	stats.StudentCount = int(studentCount)
	
	// 教师数
	var teacherCount int64
	if err := r.db.Model(&User{}).Where("role = ?", "teacher").Count(&teacherCount).Error; err != nil {
		return stats, err
	}
	stats.TeacherCount = int(teacherCount)
	
	// 管理员数
	var adminCount int64
	if err := r.db.Model(&User{}).Where("role = ?", "admin").Count(&adminCount).Error; err != nil {
		return stats, err
	}
	stats.AdminCount = int(adminCount)
	
	// 总项目数
	var totalProjects int64
	if err := r.db.Model(&struct{}{}).Table("projects").Count(&totalProjects).Error; err != nil {
		return stats, err
	}
	stats.TotalProjects = int(totalProjects)
	
	// 招募中项目数
	var recruitingProjects int64
	if err := r.db.Model(&struct{}{}).Table("projects").Where("status = ?", "recruiting").Count(&recruitingProjects).Error; err != nil {
		return stats, err
	}
	stats.RecruitingProjects = int(recruitingProjects)
	
	// 总申请数
	var totalApplications int64
	if err := r.db.Model(&Application{}).Count(&totalApplications).Error; err != nil {
		return stats, err
	}
	stats.TotalApplications = int(totalApplications)
	
	// 待审核申请数
	var pendingApplications int64
	if err := r.db.Model(&Application{}).Where("status = ?", "pending").Count(&pendingApplications).Error; err != nil {
		return stats, err
	}
	stats.PendingApplications = int(pendingApplications)
	
	return stats, nil
}
