package handle

import (
	"strconv"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/service"
	"github.com/gin-gonic/gin"
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

func (h *Handlers) GetUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil { c.JSON(400, gin.H{"error":"id格式错误"}); return }
    u := h.svc.Repo().GetUser(id)
    if u == nil { c.JSON(404, gin.H{"error":"用户不存在"}); return }
    c.JSON(200, u)
}

func (h *Handlers) Me(c *gin.Context) {
    u := currentUser(c)
    if u == nil { c.JSON(401, gin.H{"error":"未认证"}); return }
    c.JSON(200, u)
}

func (h *Handlers) UpdateMe(c *gin.Context) {
    u := currentUser(c)
    if u == nil { c.JSON(401, gin.H{"error":"未认证"}); return }
    var b struct { Name string `json:"name"`; Email string `json:"email"`; Skills []string `json:"skills"` }
    if err := c.ShouldBindJSON(&b); err != nil { c.JSON(400, gin.H{"error":"invalid json"}); return }
    updated, err := h.svc.UpdateMe(u.ID, b.Name, b.Email, b.Skills)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, updated)
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

func (h *Handlers) UpdateProject(c *gin.Context) {
    var p domain.Project
    if !parseJSON(c, &p) { return }
    if p.ID == 0 { c.JSON(400, gin.H{"error":"缺少项目ID"}); return }
    // Only teacher(owner) or admin can update; admin allowed by router
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        cur := h.svc.Repo().GetProject(p.ID)
        if cur == nil { c.JSON(404, gin.H{"error":"项目不存在"}); return }
        if cur.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权修改该项目"}); return }
        // ensure teacher_id not changed
        p.TeacherID = cur.TeacherID
    }
    out, err := h.svc.UpdateProject(&p)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, out)
}

func (h *Handlers) DeleteProject(c *gin.Context) {
    idStr := c.Query("id")
    if idStr == "" { c.JSON(400, gin.H{"error":"缺少项目ID"}); return }
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil { c.JSON(400, gin.H{"error":"项目ID格式错误"}); return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        cur := h.svc.Repo().GetProject(id)
        if cur == nil { c.JSON(404, gin.H{"error":"项目不存在"}); return }
        if cur.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权删除该项目"}); return }
    }
    if err := h.svc.DeleteProject(id); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, gin.H{"ok": true})
}

func (h *Handlers) ArchiveProject(c *gin.Context) {
    var b struct { ID int64 `json:"id"`; Archived bool `json:"archived"` }
    if !parseJSON(c, &b) { return }
    if b.ID == 0 { c.JSON(400, gin.H{"error":"缺少项目ID"}); return }
    if cu := currentUser(c); cu != nil && cu.Role == domain.RoleTeacher {
        cur := h.svc.Repo().GetProject(b.ID)
        if cur == nil { c.JSON(404, gin.H{"error":"项目不存在"}); return }
        if cur.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权归档该项目"}); return }
    }
    if err := h.svc.SetProjectArchived(b.ID, b.Archived); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, gin.H{"ok": true})
}

func (h *Handlers) ListProjects(c *gin.Context) {
    teacher := c.Query("teacher_id")
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    list := h.svc.ListProjects(teacher)
    arch := c.Query("archived")
    filtered := make([]*domain.Project, 0)
    if arch == "1" {
        for _, p := range list { if p.Archived { filtered = append(filtered, p) } }
    } else {
        for _, p := range list { if !p.Archived { filtered = append(filtered, p) } }
    }
    list = filtered
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
    cu := currentUser(c)
    if cu == nil { c.JSON(401, gin.H{"error":"未认证"}); return }
    app := h.svc.Repo().GetApplication(t.ApplicationID)
    if app == nil { c.JSON(404, gin.H{"error":"申请不存在"}); return }
    if cu.Role == domain.RoleTeacher {
        proj := h.svc.Repo().GetProject(app.ProjectID)
        if proj == nil || proj.TeacherID != cu.ID { c.JSON(403, gin.H{"error":"无权更新该申请"}); return }
    }
    if cu.Role == domain.RoleStudent {
        if app.StudentID != cu.ID { c.JSON(403, gin.H{"error":"无权更新该申请"}); return }
        if app.Status != "approved" { c.JSON(403, gin.H{"error":"仅已通过的申请可记录进度"}); return }
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
    fast := false
    if v := c.Query("fast"); v == "1" || v == "true" { fast = true }
    topK := 0
    if v := c.Query("top_k"); v != "" { if n, e := strconv.Atoi(v); e==nil { topK = n } }
    var res []domain.MatchResult
    if fast || topK > 0 {
        res, err = h.svc.MatchForStudentOpt(sid, fast, topK)
    } else {
        res, err = h.svc.MatchForStudent(sid)
    }
    if err != nil { c.JSON(404, gin.H{"error": err.Error()}); return }
    c.JSON(200, res)
}

func (h *Handlers) AnalyzeApplications(c *gin.Context) {
    tidStr := c.Query("teacher_id")
    if tidStr == "" { c.JSON(400, gin.H{"error":"缺少teacher_id"}); return }
    tid, err := strconv.ParseInt(tidStr, 10, 64)
    if err != nil { c.JSON(400, gin.H{"error":"teacher_id格式错误"}); return }
    cu := currentUser(c)
    if cu != nil && cu.Role == domain.RoleTeacher && cu.ID != tid { c.JSON(403, gin.H{"error":"只能分析本人项目的申请"}); return }
    fast := false
    if v := c.Query("fast"); v == "1" || v == "true" { fast = true }
    views, err := h.svc.AnalyzeApplicationsForTeacher(tid, c.Query("project_id"), fast)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, views)
}

func (h *Handlers) ListApplications(c *gin.Context) {
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    fast := false
    if v := c.Query("fast"); v == "1" || v == "true" { fast = true }
    views, err := h.svc.ListApplicationsWithScoresOpt(c.Query("project_id"), c.Query("status"), page, size, fast)
    if err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, views)
}

func (h *Handlers) ListMyApplications(c *gin.Context) {
    cu := currentUser(c)
    if cu == nil || cu.Role != domain.RoleStudent { c.JSON(403, gin.H{"error":"无权限"}); return }
    page := 1; size := 50
    if v := c.Query("page"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { page=n } }
    if v := c.Query("page_size"); v != "" { if n, err := strconv.Atoi(v); err==nil && n>0 { size=n } }
    fast := false
    if v := c.Query("fast"); v == "1" || v == "true" { fast = true }
    computeScores := true
    if v := c.Query("scores"); v == "0" || v == "false" { computeScores = false }
    var views []domain.ApplicationView
    var err error
    if !computeScores {
        views, err = h.svc.ListStudentApplicationsPlain(cu.ID, c.Query("status"))
    } else if fast {
        views, err = h.svc.ListStudentApplicationsWithScoresOpt(cu.ID, c.Query("status"), true)
    } else {
        views, err = h.svc.ListStudentApplicationsWithScores(cu.ID, c.Query("status"))
    }
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
