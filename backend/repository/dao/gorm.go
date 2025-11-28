package dao

import (
	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"gorm.io/gorm"
)

type GormDAO struct { db *gorm.DB }

func NewGormDAO(db *gorm.DB) *GormDAO { return &GormDAO{db: db} }

func (d *GormDAO) AddUser(u *domain.User) (*domain.User, error) {
    tx := d.db.Create(u)
    return u, tx.Error
}
func (d *GormDAO) ListUsers() []*domain.User {
    var items []domain.User
    d.db.Find(&items)
    var out []*domain.User
    for i := range items { out = append(out, &items[i]) }
    return out
}
func (d *GormDAO) GetUser(id int64) *domain.User {
    var u domain.User
    if err := d.db.First(&u, id).Error; err != nil { return nil }
    return &u
}
func (d *GormDAO) GetUserByEmail(email string) *domain.User {
    var u domain.User
    if err := d.db.Where("email = ?", email).First(&u).Error; err != nil { return nil }
    return &u
}

func (d *GormDAO) UpdateUserRole(id int64, role domain.Role) error {
    return d.db.Model(&domain.User{}).Where("id = ?", id).Update("role", role).Error
}

func (d *GormDAO) AddProject(p *domain.Project) (*domain.Project, error) {
    tx := d.db.Create(p)
    return p, tx.Error
}
func (d *GormDAO) ListProjects() []*domain.Project {
    var items []domain.Project
    d.db.Find(&items)
    var out []*domain.Project
    for i := range items { out = append(out, &items[i]) }
    return out
}
func (d *GormDAO) GetProject(id int64) *domain.Project {
    var p domain.Project
    if err := d.db.First(&p, id).Error; err != nil { return nil }
    return &p
}

func (d *GormDAO) AddApplication(a *domain.Application) (*domain.Application, error) {
    tx := d.db.Create(a)
    return a, tx.Error
}
func (d *GormDAO) ListApplications() []*domain.Application {
    var items []domain.Application
    d.db.Find(&items)
    var out []*domain.Application
    for i := range items { out = append(out, &items[i]) }
    return out
}
func (d *GormDAO) GetApplication(id int64) *domain.Application {
    var a domain.Application
    if err := d.db.First(&a, id).Error; err != nil { return nil }
    return &a
}
func (d *GormDAO) UpdateApplicationStatus(id int64, status string) error {
    return d.db.Model(&domain.Application{}).Where("id = ?", id).Update("status", status).Error
}
func (d *GormDAO) AddTracking(t *domain.Tracking) (*domain.Tracking, error) {
    tx := d.db.Create(t)
    return t, tx.Error
}

func (d *GormDAO) ListTrackingsByApplication(appID int64) []*domain.Tracking {
    var items []domain.Tracking
    d.db.Where("application_id = ?", appID).Find(&items)
    var out []*domain.Tracking
    for i := range items { out = append(out, &items[i]) }
    return out
}
func (d *GormDAO) AddFeedback(f *domain.Feedback) (*domain.Feedback, error) {
    tx := d.db.Create(f)
    return f, tx.Error
}
func (d *GormDAO) ListFeedbacks() []*domain.Feedback {
    var items []domain.Feedback
    d.db.Find(&items)
    var out []*domain.Feedback
    for i := range items { out = append(out, &items[i]) }
    return out
}
func (d *GormDAO) AddDocument(doc *domain.Document) (*domain.Document, error) {
    tx := d.db.Create(doc)
    return doc, tx.Error
}
func (d *GormDAO) ListDocumentsByApplication(appID int64) []*domain.Document {
    var items []domain.Document
    d.db.Where("application_id = ?", appID).Find(&items)
    var out []*domain.Document
    for i := range items { out = append(out, &items[i]) }
    return out
}
