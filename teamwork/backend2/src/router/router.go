package router

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/auth"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/handle"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/repository"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
        defer cancel()
        c.Request = c.Request.WithContext(ctx)
        done := make(chan struct{})
        go func() {
            c.Next()
            close(done)
        }()
        select {
        case <-ctx.Done():
            c.JSON(http.StatusGatewayTimeout, gin.H{"error":"请求超时"})
            c.Abort()
        case <-done:
        }
    }
}

func NewRouter(h *handle.Handlers, ah *handle.AuthHandlers, repo repository.Repo) *gin.Engine {
    r := gin.New()
    r.SetTrustedProxies(nil)
    r.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        return fmt.Sprintf("%s | %3d | %13v | %15s | %-7s %s | %s\n",
            param.TimeStamp.Format(time.RFC3339),
            param.StatusCode,
            param.Latency,
            param.ClientIP,
            param.Method,
            param.Path,
            param.ErrorMessage,
        )
    }))
    r.Use(gin.Recovery())
    r.Use(cors.New(cors.Config{
        AllowAllOrigins: true,
        AllowMethods:    []string{"GET","POST","PUT","PATCH","DELETE","OPTIONS"},
        AllowHeaders:    []string{"Origin","Content-Type","Accept","Authorization"},
        ExposeHeaders:   []string{"Content-Length"},
        AllowCredentials: false,
        MaxAge:          12 * time.Hour,
    }))
    r.Use(TimeoutMiddleware(5 * time.Second))
    pub := r.Group("/api")
    pub.POST("/auth/register", ah.Register)
    pub.POST("/auth/login", ah.Login)
    r.Use(auth.Middleware(repo))
    api := r.Group("/api")
    users := api.Group("/users")
    users.GET("", h.ListUsers)
    users.POST("", auth.RequireRole(domain.RoleAdmin), h.CreateUser)
    users.GET("/:id", h.GetUser)

    api.GET("/me", h.Me)

    projects := api.Group("/projects")
    projects.GET("", h.ListProjects)
    projects.POST("", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.CreateProject)
    projects.PATCH("", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.UpdateProject)
    projects.DELETE("", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.DeleteProject)
    projects.POST("/archive", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.ArchiveProject)

    matches := api.Group("/matches")
    matches.GET("", auth.RequireRole(domain.RoleStudent, domain.RoleAdmin), h.Matches)
    matches.GET("/analyze", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.AnalyzeApplications)
    
    applications := api.Group("/applications")
    applications.GET("", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.ListApplications)
    applications.GET("/mine", auth.RequireRole(domain.RoleStudent), h.ListMyApplications)

    application := api.Group("/application")
    application.POST("/status", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.UpdateApplicationStatus)

    
    tracking := api.Group("/tracking")
    tracking.POST("", auth.RequireRole(domain.RoleStudent, domain.RoleTeacher, domain.RoleAdmin), h.Tracking)
    tracking.GET("", auth.RequireRole(domain.RoleStudent, domain.RoleTeacher, domain.RoleAdmin), h.ListTrackings)

    feedback := api.Group("/feedback")
    feedback.POST("", auth.RequireRole(domain.RoleTeacher, domain.RoleAdmin), h.Feedback)

    apply := api.Group("/apply")
    apply.POST("", auth.RequireRole(domain.RoleStudent), h.Apply)

    upload := api.Group("/upload")
    upload.POST("", auth.RequireRole(domain.RoleStudent), handle.NewUploadHandlers(h.Service()).Upload)

    documents := api.Group("/documents")
    documents.GET("", auth.RequireRole(domain.RoleStudent, domain.RoleTeacher, domain.RoleAdmin), handle.NewUploadHandlers(h.Service()).List)
    documents.GET("/download", auth.RequireRole(domain.RoleStudent, domain.RoleTeacher, domain.RoleAdmin), handle.NewUploadHandlers(h.Service()).Download)

    admin := api.Group("/admin").Use(auth.RequireRole(domain.RoleAdmin))
    admin.GET("/stats", handle.NewAdminHandlers(h.Service()).Stats)
    admin.POST("/user/role", handle.NewAdminHandlers(h.Service()).UpdateUserRole)
    api.PUT("/me", h.UpdateMe)
    return r
}
