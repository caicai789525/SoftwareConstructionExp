package service

import (
    "errors"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
)

func (s *Service) AddTracking(t *domain.Tracking) (*domain.Tracking, error) {
    if t.ApplicationID == 0 || t.Progress == "" { return nil, errors.New("缺少必填字段") }
    return s.repo.AddTracking(t)
}

func (s *Service) AddFeedback(f *domain.Feedback) (*domain.Feedback, error) {
    if f.FromUserID == 0 || f.ToUserID == 0 || f.ApplicationID == 0 || f.Rating == 0 { return nil, errors.New("缺少必填字段") }
    return s.repo.AddFeedback(f)
}

func (s *Service) ListTrackingsByApplication(appID int64) []*domain.Tracking {
    return s.repo.ListTrackingsByApplication(appID)
}
