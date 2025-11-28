package service

import (
	"errors"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"golang.org/x/crypto/bcrypt"
)

func (s *Service) CreateUser(u *domain.User) (*domain.User, error) {
    if u.Name == "" || u.Email == "" || u.Role == "" { return nil, errors.New("缺少必填字段") }
    u.Skills = normalize(u.Skills)
    return s.repo.AddUser(u)
}

func (s *Service) Register(name, email, password string, role domain.Role, skills []string) (*domain.User, error) {
    if name == "" || email == "" || password == "" || role == "" { return nil, errors.New("缺少必填字段") }
    if existing := s.repo.GetUserByEmail(email); existing != nil { return nil, errors.New("邮箱已存在") }
    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil { return nil, err }
    u := &domain.User{Name: name, Email: email, Role: role, Skills: normalize(skills), PasswordHash: string(hash)}
    return s.repo.AddUser(u)
}

func (s *Service) Login(email, password string) (*domain.User, error) {
    u := s.repo.GetUserByEmail(email)
    if u == nil { return nil, errors.New("用户不存在") }
    if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil { return nil, errors.New("密码错误") }
    return u, nil
}

func (s *Service) ListUsers(role string) []*domain.User {
    us := s.repo.ListUsers()
    if role == "" { return us }
    var out []*domain.User
    for _, u := range us { if string(u.Role) == role { out = append(out, u) } }
    return out
}

func (s *Service) UpdateUserRole(userID int64, role domain.Role) error {
    if role == "" { return errors.New("缺少角色") }
    return s.repo.UpdateUserRole(userID, role)
}
