package service

func (s *Service) Stats() map[string]any {
    users := s.repo.ListUsers()
    projects := s.repo.ListProjects()
    apps := s.repo.ListApplications()
    fbs := s.repo.ListFeedbacks()
    roleCount := map[string]int{}
    for _, u := range users { roleCount[string(u.Role)]++ }
    appStatus := map[string]int{}
    for _, a := range apps { appStatus[a.Status]++ }
    avgRating := 0.0
    if len(fbs) > 0 { sum := 0; for _, f := range fbs { sum += f.Rating }; avgRating = float64(sum)/float64(len(fbs)) }
    return map[string]any{
        "users": roleCount,
        "projects": len(projects),
        "applications": len(apps),
        "application_status": appStatus,
        "avg_rating": avgRating,
    }
}