// 认证与授权模块
package auth

import (
	"time"
	"github.com/golang-jwt/jwt/v5"
)

// JWT密钥
var jwtSecret = []byte("your-secret-key")

// 自定义Claims
type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// 生成JWT令牌
func GenerateToken(userID uint, role string) (string, error) {
	// 设置过期时间
	expirationTime := time.Now().Add(24 * time.Hour)
	
	// 创建Claims
	claims := &Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "student-project-match-system",
		},
	}
	
	// 创建令牌
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// 签名令牌
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

// 解析JWT令牌
func ParseToken(tokenString string) (*Claims, error) {
	// 解析令牌
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	
	if err != nil {
		return nil, err
	}
	
	// 验证令牌
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	
	return nil, err
}
