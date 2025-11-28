package handle

import (
    "strconv"
    "github.com/gin-gonic/gin"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/service"
)

type Handlers struct { svc *service.Service }

func NewHandlers(s *service.Service) *Handlers { return &Handlers{svc: s} }

func (h *Handlers) Service() *service.Service { return h.svc }

func parseJSON[T any](c *gin.Context, v *T) bool {
    if err := c.ShouldBindJSON(v); err != nil {
        c.JSON(400, gin.H{"error": "invalid json"})
        return false
    }
    return true
}

func currentUser(c *gin.Context) *domain.User {
    v, ok := c.Get("user"); if !ok { return nil }
    u, _ := v.(*domain.User); return u
}

func (h *Handlers) CreateUser(c *gin.Context) {
    var u domain.User
    if !parseJSON(c, &u) { return }
    created, err := h.svc.CreateUser(&u)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(201, created)
}

func (h *Handlers) ListUsers(c *gin.Context) {
    role := c.Query("role")
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    list := h.svc.ListUsers(role)
    start := (page-1)*size; if start < 0 { start = 0 }
    end := start+size; if end > len(list) { end = len(list) }
    if start > len(list) { list = []*domain.User{} } else { list = list[start:end] }
    c.JSON(200, list)
}

func (h *Handlers) CreateProject(c *gin.Context) {
    var p domain.Project
    if !parseJSON(c, &p) { return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        if p.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"只能为本人发布项目"}); return }
    }
    created, err := h.svc.CreateProject(&p)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(201, created)
}

func (h *Handlers) ListProjects(c *gin.Context) {
    teacher := c.Query("teacher_id")
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    list := h.svc.ListProjects(teacher)
    start := (page-1)*size; if start < 0 { start = 0 }
    end := start+size; if end > len(list) { end = len(list) }
    if start > len(list) { list = []*domain.Project{} } else { list = list[start:end] }
    c.JSON(200, list)
}

func (h *Handlers) Apply(c *gin.Context) {
    var a domain.Application
    if !parseJSON(c, &a) { return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleStudent {
        if a.StudentID != cu.ID { c.JSON(403, gin.H{"error":"只能为本人提交申请"}); return }
    }
    a.Status = "submitted"
    created, err := h.svc.Apply(&a)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(201, created)
}

func (h *Handlers) Tracking(c *gin.Context) {
    var t domain.Tracking
    if !parseJSON(c, &t) { return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        app := h.svc.Repo().GetApplication(t.ApplicationID)
        if app == nil { c.JSON(404, gin.H{"error":"申请不存在"}); return }
        proj := h.svc.Repo().GetProject(app.ProjectID)
        if proj == nil || proj.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权更新该申请"}); return }
    }
    created, err := h.svc.AddTracking(&t)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(201, created)
}

func (h *Handlers) Feedback(c *gin.Context) {
    var f domain.Feedback
    if !parseJSON(c, &f) { return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        app := h.svc.Repo().GetApplication(f.ApplicationID)
        if app == nil { c.JSON(404, gin.H{"error":"申请不存在"}); return }
        proj := h.svc.Repo().GetProject(app.ProjectID)
        if proj == nil || proj.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权评价该申请"}); return }
    }
    created, err := h.svc.AddFeedback(&f)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(201, created)
}

func (h *Handlers) Matches(c *gin.Context) {
    sidStr := c.Query("student_id")
    if sidStr == "" { c.JSON(400, gin.H{"error": "缺少student_id"}); return }
    sid, err := strconv.ParseInt(sidStr, 10, 64)
    if err != nil { c.JSON(400, gin.H{"error": "student_id格式错误"}); return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleStudent && cu.ID != sid { c.JSON(403, gin.H{"error":"只能查看本人匹配"}); return }
    res, err := h.svc.MatchForStudent(sid)
    if err != nil { c.JSON(404, gin.H{"error": err.Error()}); return }
    c.JSON(200, res)
}

func (h *Handlers) ListApplications(c *gin.Context) {
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    views, err := h.svc.ListApplicationsWithScores(c.Query("project_id"), c.Query("status"))
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    start := (page-1)*size; if start < 0 { start = 0 }
    end := start+size; if end > len(views) { end = len(views) }
    if start > len(views) { views = []domain.ApplicationView{} } else { views = views[start:end] }
    c.JSON(200, views)
}

func (h *Handlers) ListMyApplications(c *gin.Context) {
    cu := currentUser(c)
    if cu == nil || cu.Role != domain.RoleStudent { c.JSON(403, gin.H{"error":"无权限"}); return }
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    views, err := h.svc.ListStudentApplicationsWithScores(cu.ID, c.Query("status"))
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    start := (page-1)*size; if start < 0 { start = 0 }
    end := start+size; if end > len(views) { end = len(views) }
    if start > len(views) { views = []domain.ApplicationView{} } else { views = views[start:end] }
    c.JSON(200, views)
}

func (h *Handlers) UpdateApplicationStatus(c *gin.Context) {
    var b struct { ApplicationID int64 `json:"application_id"`; Status string `json:"status"` }
    if !parseJSON(c, &b) { return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        app := h.svc.Repo().GetApplication(b.ApplicationID)
        if app == nil { c.JSON(404, gin.H{"error":"申请不存在"}); return }
        proj := h.svc.Repo().GetProject(app.ProjectID)
        if proj == nil || proj.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权修改该申请"}); return }
    }
    if err := h.svc.UpdateApplicationStatus(b.ApplicationID, b.Status); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, gin.H{"ok": true})
}

func (h *Handlers) ListTrackings(c *gin.Context) {
    appIDStr := c.Query("application_id")
    if appIDStr == "" { c.JSON(400, gin.H{"error":"缺少application_id"}); return }
    appID, err := strconv.ParseInt(appIDStr, 10, 64)
    if err != nil { c.JSON(400, gin.H{"error":"application_id格式错误"}); return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleStudent {
        app := h.svc.Repo().GetApplication(appID)
        if app == nil { c.JSON(404, gin.H{"error":"申请不存在"}); return }
        if app.StudentID != cu.ID { c.JSON(403, gin.H{"error":"无权查看该申请进度"}); return }
    }
    ts := h.svc.ListTrackingsByApplication(appID)
    c.JSON(200, ts)
}
