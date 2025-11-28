package service

import (
    "errors"
    "strconv"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
)

func (s *Service) Apply(a *domain.Application) (*domain.Application, error) {
    if a.StudentID == 0 || a.ProjectID == 0 { return nil, errors.New("缺少必填字段") }
    a.Status = "submitted"
    return s.repo.AddApplication(a)
}

func (s *Service) ListApplicationsWithScores(projectID string, status string) ([]domain.ApplicationView, error) {
    var pid int64
    if projectID != "" { pid, _ = strconv.ParseInt(projectID, 10, 64) }
    apps := s.repo.ListApplications()
    var views []domain.ApplicationView
    for _, a := range apps {
        if projectID != "" && a.ProjectID != pid { continue }
        if status != "" && a.Status != status { continue }
        stu := s.repo.GetUser(a.StudentID)
        proj := s.repo.GetProject(a.ProjectID)
        if stu == nil || proj == nil { continue }
        score := 0.0
        res := s.matcher.Match(stu, []*domain.Project{proj})
        if len(res) > 0 { score = res[0].Score }
        views = append(views, domain.ApplicationView{Application: a, Student: stu, Project: proj, Score: score})
    }
    return views, nil
}

func (s *Service) ListStudentApplicationsWithScores(studentID int64, status string) ([]domain.ApplicationView, error) {
    apps := s.repo.ListApplications()
    var views []domain.ApplicationView
    for _, a := range apps {
        if a.StudentID != studentID { continue }
        if status != "" && a.Status != status { continue }
        stu := s.repo.GetUser(a.StudentID)
        proj := s.repo.GetProject(a.ProjectID)
        if stu == nil || proj == nil { continue }
        score := 0.0
        res := s.matcher.Match(stu, []*domain.Project{proj})
        if len(res) > 0 { score = res[0].Score }
        views = append(views, domain.ApplicationView{Application: a, Student: stu, Project: proj, Score: score})
    }
    return views, nil
}

func (s *Service) UpdateApplicationStatus(appID int64, status string) error {
    if status == "" { return errors.New("缺少状态") }
    return s.repo.UpdateApplicationStatus(appID, status)
}
