package handle

import (
    "github.com/gin-gonic/gin"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/service"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
)

type AdminHandlers struct { svc *service.Service }

func NewAdminHandlers(s *service.Service) *AdminHandlers { return &AdminHandlers{svc: s} }

func (h *AdminHandlers) Stats(c *gin.Context) {
    c.JSON(200, h.svc.Stats())
}

func (h *AdminHandlers) UpdateUserRole(c *gin.Context) {
    var b struct{ UserID int64 `json:"user_id"`; Role string `json:"role"` }
    if err := c.ShouldBindJSON(&b); err != nil { c.JSON(400, gin.H{"error":"invalid json"}); return }
    if b.UserID == 0 || b.Role == "" { c.JSON(400, gin.H{"error":"缺少必填字段"}); return }
    if err := h.svc.UpdateUserRole(b.UserID, domain.Role(b.Role)); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
    c.JSON(200, gin.H{"ok": true})
}
