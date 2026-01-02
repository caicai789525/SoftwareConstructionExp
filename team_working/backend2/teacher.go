// 教师相关功能模块
package teacher

import (
	"gorm.io/gorm"
)

// 教师模型
type Teacher struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	TeacherID     string `gorm:"unique;not null" json:"teacher_id"`
	Name          string `gorm:"not null" json:"name"`
	College       string `gorm:"not null" json:"college"`
	ResearchArea  string `json:"research_area"`
	Email         string `gorm:"unique" json:"email"`
	Phone         string `json:"phone"`
	UserID        uint   `gorm:"not null" json:"user_id"`
}

// 项目模型
type Project struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	Title           string `gorm:"not null" json:"title"`
	Description     string `gorm:"not null" json:"description"`
	Requirements    string `json:"requirements"`
	MaxMembers      int    `gorm:"not null" json:"max_members"`
	CurrentMembers  int    `gorm:"default:0" json:"current_members"`
	Status          string `gorm:"not null" json:"status"` // recruiting, closed, archived
	TeacherID       uint   `gorm:"not null" json:"teacher_id"`
	Teacher         Teacher `gorm:"foreignKey:TeacherID" json:"teacher"`
}

// 教师仓库接口
type TeacherRepository interface {
	Create(teacher *Teacher) error
	GetByID(id uint) (*Teacher, error)
	GetByUserID(userID uint) (*Teacher, error)
	Update(teacher *Teacher) error
	Delete(id uint) error
	GetAll() ([]Teacher, error)
}

// 项目仓库接口
type ProjectRepository interface {
	Create(project *Project) error
	GetByID(id uint) (*Project, error)
	GetByTeacherID(teacherID uint) ([]Project, error)
	Update(project *Project) error
	Delete(id uint) error
	GetAll() ([]Project, error)
	GetRecruitingProjects() ([]Project, error)
}

// 教师仓库实现
type teacherRepository struct {
	db *gorm.DB
}

// 项目仓库实现
type projectRepository struct {
	db *gorm.DB
}

// 创建教师仓库实例
func NewTeacherRepository(db *gorm.DB) TeacherRepository {
	return &teacherRepository{db: db}
}

// 创建项目仓库实例
func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &projectRepository{db: db}
}

// 创建教师
func (r *teacherRepository) Create(teacher *Teacher) error {
	return r.db.Create(teacher).Error
}

// 根据ID获取教师
func (r *teacherRepository) GetByID(id uint) (*Teacher, error) {
	var teacher Teacher
	result := r.db.First(&teacher, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &teacher, nil
}

// 根据用户ID获取教师
func (r *teacherRepository) GetByUserID(userID uint) (*Teacher, error) {
	var teacher Teacher
	result := r.db.Where("user_id = ?", userID).First(&teacher)
	if result.Error != nil {
		return nil, result.Error
	}
	return &teacher, nil
}

// 更新教师信息
func (r *teacherRepository) Update(teacher *Teacher) error {
	return r.db.Save(teacher).Error
}

// 删除教师
func (r *teacherRepository) Delete(id uint) error {
	return r.db.Delete(&Teacher{}, id).Error
}

// 获取所有教师
func (r *teacherRepository) GetAll() ([]Teacher, error) {
	var teachers []Teacher
	result := r.db.Find(&teachers)
	if result.Error != nil {
		return nil, result.Error
	}
	return teachers, nil
}

// 创建项目
func (r *projectRepository) Create(project *Project) error {
	return r.db.Create(project).Error
}

// 根据ID获取项目
func (r *projectRepository) GetByID(id uint) (*Project, error) {
	var project Project
	result := r.db.Preload("Teacher").First(&project, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &project, nil
}

// 根据教师ID获取项目
func (r *projectRepository) GetByTeacherID(teacherID uint) ([]Project, error) {
	var projects []Project
	result := r.db.Where("teacher_id = ?", teacherID).Find(&projects)
	if result.Error != nil {
		return nil, result.Error
	}
	return projects, nil
}

// 更新项目
func (r *projectRepository) Update(project *Project) error {
	return r.db.Save(project).Error
}

// 删除项目
func (r *projectRepository) Delete(id uint) error {
	return r.db.Delete(&Project{}, id).Error
}

// 获取所有项目
func (r *projectRepository) GetAll() ([]Project, error) {
	var projects []Project
	result := r.db.Preload("Teacher").Find(&projects)
	if result.Error != nil {
		return nil, result.Error
	}
	return projects, nil
}

// 获取招募中的项目
func (r *projectRepository) GetRecruitingProjects() ([]Project, error) {
	var projects []Project
	result := r.db.Preload("Teacher").Where("status = ?", "recruiting").Find(&projects)
	if result.Error != nil {
		return nil, result.Error
	}
	return projects, nil
}
