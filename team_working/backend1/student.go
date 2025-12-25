// 学生相关功能模块
package student

import (
	"gorm.io/gorm"
)

// 学生模型
type Student struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	StudentID string `gorm:"unique;not null" json:"student_id"`
	Name      string `gorm:"not null" json:"name"`
	Major     string `gorm:"not null" json:"major"`
	Grade     string `gorm:"not null" json:"grade"`
	Email     string `gorm:"unique" json:"email"`
	Phone     string `json:"phone"`
	Interests string `json:"interests"`
	UserID    uint   `gorm:"not null" json:"user_id"`
}

// 学生仓库接口
type StudentRepository interface {
	Create(student *Student) error
	GetByID(id uint) (*Student, error)
	GetByUserID(userID uint) (*Student, error)
	Update(student *Student) error
	Delete(id uint) error
	GetAll() ([]Student, error)
}

// 学生仓库实现
type studentRepository struct {
	db *gorm.DB
}

// 创建学生仓库实例
func NewStudentRepository(db *gorm.DB) StudentRepository {
	return &studentRepository{db: db}
}

// 创建学生
func (r *studentRepository) Create(student *Student) error {
	return r.db.Create(student).Error
}

// 根据ID获取学生
func (r *studentRepository) GetByID(id uint) (*Student, error) {
	var student Student
	result := r.db.First(&student, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &student, nil
}

// 根据用户ID获取学生
func (r *studentRepository) GetByUserID(userID uint) (*Student, error) {
	var student Student
	result := r.db.Where("user_id = ?", userID).First(&student)
	if result.Error != nil {
		return nil, result.Error
	}
	return &student, nil
}

// 更新学生信息
func (r *studentRepository) Update(student *Student) error {
	return r.db.Save(student).Error
}

// 删除学生
func (r *studentRepository) Delete(id uint) error {
	return r.db.Delete(&Student{}, id).Error
}

// 获取所有学生
func (r *studentRepository) GetAll() ([]Student, error) {
	var students []Student
	result := r.db.Find(&students)
	if result.Error != nil {
		return nil, result.Error
	}
	return students, nil
}
