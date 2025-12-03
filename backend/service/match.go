package service

import (
	"errors"
	"sort"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
)

func (s *Service) MatchForStudent(studentID int64) ([]domain.MatchResult, error) {
    stu := s.repo.GetUser(studentID)
    if stu == nil || stu.Role != domain.RoleStudent { return nil, errors.New("学生不存在") }
    ps := s.repo.ListProjects()
    return s.matcher.Match(stu, ps), nil
}

func (s *Service) MatchForStudentOpt(studentID int64, fast bool, topK int) ([]domain.MatchResult, error) {
    stu := s.repo.GetUser(studentID)
    if stu == nil || stu.Role != domain.RoleStudent { return nil, errors.New("学生不存在") }
    projects := s.repo.ListProjects()
    if fast {
        return SimpleMatcher{}.Match(stu, projects), nil
    }
    if topK <= 0 { topK = 5 }
    // prefilter with simple matcher to get topK
    simple := SimpleMatcher{}.Match(stu, projects)
    sort.Slice(simple, func(i, j int) bool { return simple[i].Score > simple[j].Score })
    // pick topK projects
    var subset []*domain.Project
    for i := 0; i < len(simple) && i < topK; i++ { subset = append(subset, simple[i].Project) }
    if len(subset) == 0 { return []domain.MatchResult{}, nil }
    // run configured matcher on subset (LLM if enabled)
    detailed := s.matcher.Match(stu, subset)
    // ensure results sorted by score desc
    sort.Slice(detailed, func(i, j int) bool { return detailed[i].Score > detailed[j].Score })
    return detailed, nil
}
