package service

import (
	"errors"
	"os"
	"strconv"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
)

func (s *Service) Apply(a *domain.Application) (*domain.Application, error) {
    if a.StudentID == 0 || a.ProjectID == 0 { return nil, errors.New("缺少必填字段") }
    apps := s.repo.ListApplications()
    for _, ex := range apps { if ex.StudentID == a.StudentID && ex.ProjectID == a.ProjectID { return nil, errors.New("已提交过该项目申请") } }
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

func (s *Service) ListApplicationsWithScoresOpt(projectID, status string, page, size int, useSimple bool) ([]domain.ApplicationView, error) {
    if page <= 0 { page = 1 }
    if size <= 0 { size = 50 }
    var pid int64
    if projectID != "" { pid, _ = strconv.ParseInt(projectID, 10, 64) }
    apps := s.repo.ListApplications()
    start := (page-1)*size
    end := start + size
    var matcher domain.Matcher = s.matcher
    if useSimple || os.Getenv("SC_LLM_LIST_DISABLE") == "1" {
        matcher = SimpleMatcher{}
    }
    var views []domain.ApplicationView
    idx := 0
    for _, a := range apps {
        if projectID != "" && a.ProjectID != pid { continue }
        if status != "" && a.Status != status { continue }
        if idx >= start && idx < end {
            stu := s.repo.GetUser(a.StudentID)
            proj := s.repo.GetProject(a.ProjectID)
            if stu == nil || proj == nil { idx++; continue }
            score := 0.0
            res := matcher.Match(stu, []*domain.Project{proj})
            if len(res) > 0 { score = res[0].Score }
            views = append(views, domain.ApplicationView{Application: a, Student: stu, Project: proj, Score: score})
        }
        idx++
        if idx >= end { break }
    }
    return views, nil
}

func (s *Service) ListStudentApplicationsWithScores(studentID int64, status string) ([]domain.ApplicationView, error) {
    apps := s.repo.ListApplicationsByStudent(studentID, status)
    var views []domain.ApplicationView
    for _, a := range apps {
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

func (s *Service) ListStudentApplicationsWithScoresOpt(studentID int64, status string, useSimple bool) ([]domain.ApplicationView, error) {
    var matcher domain.Matcher = s.matcher
    if useSimple || os.Getenv("SC_LLM_LIST_DISABLE") == "1" {
        matcher = SimpleMatcher{}
    }
    apps := s.repo.ListApplicationsByStudent(studentID, status)
    var views []domain.ApplicationView
    for _, a := range apps {
        stu := s.repo.GetUser(a.StudentID)
        proj := s.repo.GetProject(a.ProjectID)
        if stu == nil || proj == nil { continue }
        score := 0.0
        res := matcher.Match(stu, []*domain.Project{proj})
        if len(res) > 0 { score = res[0].Score }
        views = append(views, domain.ApplicationView{Application: a, Student: stu, Project: proj, Score: score})
    }
    return views, nil
}

func (s *Service) ListStudentApplicationsPlain(studentID int64, status string) ([]domain.ApplicationView, error) {
    apps := s.repo.ListApplicationsByStudent(studentID, status)
    var views []domain.ApplicationView
    for _, a := range apps {
        stu := s.repo.GetUser(a.StudentID)
        proj := s.repo.GetProject(a.ProjectID)
        if stu == nil || proj == nil { continue }
        views = append(views, domain.ApplicationView{Application: a, Student: stu, Project: proj, Score: 0})
    }
    return views, nil
}

func (s *Service) AnalyzeApplicationsForTeacher(teacherID int64, projectID string, useSimple bool) ([]domain.ApplicationAnalysis, error) {
    var pid int64
    if projectID != "" { pid, _ = strconv.ParseInt(projectID, 10, 64) }
    apps := s.repo.ListApplications()
    var matcher domain.Matcher = s.matcher
    if useSimple || os.Getenv("SC_LLM_LIST_DISABLE") == "1" { matcher = SimpleMatcher{} }
    var out []domain.ApplicationAnalysis
    for _, a := range apps {
        proj := s.repo.GetProject(a.ProjectID)
        if proj == nil || proj.TeacherID != teacherID { continue }
        if projectID != "" && a.ProjectID != pid { continue }
        stu := s.repo.GetUser(a.StudentID)
        if stu == nil { continue }
        res := matcher.Match(stu, []*domain.Project{proj})
        score := 0.0
        reason := ""
        if len(res) > 0 { score = res[0].Score; reason = res[0].Reason }
        out = append(out, domain.ApplicationAnalysis{Application: a, Student: stu, Project: proj, Score: score, Reason: reason})
    }
    return out, nil
}

func (s *Service) UpdateApplicationStatus(appID int64, status string) error {
    if status == "" { return errors.New("缺少状态") }
    existing := s.repo.GetApplication(appID)
    if existing == nil { return errors.New("申请不存在") }
    if existing.Status == status { return nil }
    if existing.Status == "approved" { return errors.New("已通过的申请不可再次修改") }
    return s.repo.UpdateApplicationStatus(appID, status)
}
