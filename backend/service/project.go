package service

import (
	"errors"
	"strconv"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
)

func (s *Service) CreateProject(p *domain.Project) (*domain.Project, error) {
    if p.TeacherID == 0 || p.Title == "" || p.Description == "" || len(p.Requirements) == 0 { return nil, errors.New("缺少必填字段") }
    p.Requirements = normalize(p.Requirements)
    p.Tags = normalize(p.Tags)
    return s.repo.AddProject(p)
}

func (s *Service) ListProjects(teacherID string) []*domain.Project {
    ps := s.repo.ListProjects()
    if teacherID == "" { return ps }
    tid, _ := strconv.ParseInt(teacherID, 10, 64)
    var out []*domain.Project
    for _, p := range ps { if p.TeacherID == tid { out = append(out, p) } }
    return out
}
