package repository

import (
	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/repository/cache"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/repository/dao"
	"gorm.io/gorm"
)

type Repo interface {
    AddUser(u *domain.User) (*domain.User, error)
    ListUsers() []*domain.User
    GetUser(id int64) *domain.User
    GetUserByEmail(email string) *domain.User
    UpdateUserRole(id int64, role domain.Role) error
    UpdateUser(u *domain.User) (*domain.User, error)

    AddProject(p *domain.Project) (*domain.Project, error)
    ListProjects() []*domain.Project
    GetProject(id int64) *domain.Project

    AddApplication(a *domain.Application) (*domain.Application, error)
	ListApplications() []*domain.Application
	GetApplication(id int64) *domain.Application
	UpdateApplicationStatus(id int64, status string) error
    AddTracking(t *domain.Tracking) (*domain.Tracking, error)
    ListTrackingsByApplication(appID int64) []*domain.Tracking
    AddFeedback(f *domain.Feedback) (*domain.Feedback, error)
    ListFeedbacks() []*domain.Feedback
    AddDocument(d *domain.Document) (*domain.Document, error)
    ListDocumentsByApplication(appID int64) []*domain.Document
}

type RepoImpl struct {
	dao   dao.DAO
	cache *cache.MemoryCache
}

func NewRepo(db *gorm.DB) Repo {
	d := dao.NewGormDAO(db)
	c := cache.NewMemoryCache()
	return &RepoImpl{dao: d, cache: c}
}

func (r *RepoImpl) AddUser(u *domain.User) (*domain.User, error) {
    out, err := r.dao.AddUser(u)
    if err == nil {
        r.cache.SetUser(out)
        r.cache.InvalidateUsers()
    }
    return out, err
}
func (r *RepoImpl) ListUsers() []*domain.User {
	if us := r.cache.ListUsers(); us != nil {
		return us
	}
	us := r.dao.ListUsers()
	r.cache.SetUsers(us)
	return us
}
func (r *RepoImpl) GetUser(id int64) *domain.User {
	if u := r.cache.GetUser(id); u != nil {
		return u
	}
	u := r.dao.GetUser(id)
	if u != nil {
		r.cache.SetUser(u)
	}
	return u
}
func (r *RepoImpl) GetUserByEmail(email string) *domain.User { return r.dao.GetUserByEmail(email) }
func (r *RepoImpl) UpdateUserRole(id int64, role domain.Role) error {
    err := r.dao.UpdateUserRole(id, role)
    if err == nil {
        if u := r.cache.GetUser(id); u != nil { u.Role = role }
        r.cache.InvalidateUsers()
    }
    return err
}
func (r *RepoImpl) UpdateUser(u *domain.User) (*domain.User, error) {
    out, err := r.dao.UpdateUser(u)
    if err == nil && out != nil {
        r.cache.SetUser(out)
        r.cache.InvalidateUsers()
    }
    return out, err
}

func (r *RepoImpl) AddProject(p *domain.Project) (*domain.Project, error) {
    out, err := r.dao.AddProject(p)
    if err == nil {
        r.cache.SetProject(out)
        r.cache.InvalidateProjects()
    }
    return out, err
}
func (r *RepoImpl) ListProjects() []*domain.Project {
	if ps := r.cache.ListProjects(); ps != nil {
		return ps
	}
	ps := r.dao.ListProjects()
	r.cache.SetProjects(ps)
	return ps
}
func (r *RepoImpl) GetProject(id int64) *domain.Project {
	if p := r.cache.GetProject(id); p != nil {
		return p
	}
	p := r.dao.GetProject(id)
	if p != nil {
		r.cache.SetProject(p)
	}
	return p
}

func (r *RepoImpl) AddApplication(a *domain.Application) (*domain.Application, error) {
    return r.dao.AddApplication(a)
}
func (r *RepoImpl) ListApplications() []*domain.Application     { return r.dao.ListApplications() }
func (r *RepoImpl) GetApplication(id int64) *domain.Application { return r.dao.GetApplication(id) }
func (r *RepoImpl) UpdateApplicationStatus(id int64, status string) error {
	return r.dao.UpdateApplicationStatus(id, status)
}
func (r *RepoImpl) AddTracking(t *domain.Tracking) (*domain.Tracking, error) { return r.dao.AddTracking(t) }
func (r *RepoImpl) ListTrackingsByApplication(appID int64) []*domain.Tracking { return r.dao.ListTrackingsByApplication(appID) }
func (r *RepoImpl) AddFeedback(f *domain.Feedback) (*domain.Feedback, error) { return r.dao.AddFeedback(f) }
func (r *RepoImpl) ListFeedbacks() []*domain.Feedback               { return r.dao.ListFeedbacks() }
func (r *RepoImpl) AddDocument(d *domain.Document) (*domain.Document, error) { return r.dao.AddDocument(d) }
func (r *RepoImpl) ListDocumentsByApplication(appID int64) []*domain.Document {
	return r.dao.ListDocumentsByApplication(appID)
}
