package auth

import (
    "os"
    "time"
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/repository"
)

type Claims struct {
    UserID int64      `json:"uid"`
    Role   domain.Role `json:"role"`
    jwt.RegisteredClaims
}

func secret() string {
    if s := os.Getenv("SC_JWT_SECRET"); s != "" { return s }
    return "dev"
}

func GenerateToken(u *domain.User) (string, error) {
    claims := &Claims{UserID: u.ID, Role: u.Role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(24*time.Hour))}}
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret()))
}

func Middleware(repo repository.Repo) gin.HandlerFunc {
    return func(c *gin.Context) {
        h := c.GetHeader("Authorization")
        if len(h) > 7 && (h[:7] == "Bearer " || h[:7] == "bearer ") {
            t := h[7:]
            tok, err := jwt.ParseWithClaims(t, &Claims{}, func(token *jwt.Token) (any, error) { return []byte(secret()), nil })
            if err == nil && tok.Valid {
                if cl, ok := tok.Claims.(*Claims); ok {
                    u := repo.GetUser(cl.UserID)
                    if u != nil { c.Set("user", u) }
                }
            }
        }
        c.Next()
    }
}

func RequireRole(roles ...domain.Role) gin.HandlerFunc {
    return func(c *gin.Context) {
        v, ok := c.Get("user")
        if !ok { c.AbortWithStatusJSON(401, gin.H{"error":"未认证"}); return }
        u := v.(*domain.User)
        for _, r := range roles { if u.Role == r { c.Next(); return } }
        c.AbortWithStatusJSON(403, gin.H{"error":"无权限"})
    }
}