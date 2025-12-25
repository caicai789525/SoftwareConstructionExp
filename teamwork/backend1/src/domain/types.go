package domain

import "time"

type Role string

const (
    RoleTeacher Role = "teacher"
    RoleStudent Role = "student"
    RoleAdmin   Role = "admin"
)

type User struct {
    ID           int64    `json:"id" gorm:"primaryKey"`
    Name         string   `json:"name"`
    Email        string   `json:"email" gorm:"size:191;uniqueIndex"`
    Role         Role     `json:"role" gorm:"size:32"`
    Skills       []string `json:"skills,omitempty" gorm:"serializer:json"`
    PasswordHash string   `json:"-"`
}

type Project struct {
    ID           int64    `json:"id" gorm:"primaryKey"`
    TeacherID    int64    `json:"teacher_id" gorm:"index"`
    Title        string   `json:"title"`
    Description  string   `json:"description"`
    Requirements []string `json:"requirements" gorm:"serializer:json"`
    Tags         []string `json:"tags" gorm:"serializer:json"`
    Archived     bool     `json:"archived" gorm:"index"`
}

type Application struct {
    ID        int64  `json:"id" gorm:"primaryKey"`
    StudentID int64  `json:"student_id" gorm:"index;uniqueIndex:uniq_student_project"`
    ProjectID int64  `json:"project_id" gorm:"index;uniqueIndex:uniq_student_project"`
    Status    string `json:"status" gorm:"size:32;index"`
}

type Tracking struct {
    ID            int64     `json:"id" gorm:"primaryKey"`
    ApplicationID int64     `json:"application_id" gorm:"index"`
    Progress      string    `json:"progress"`
    CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
}

type Feedback struct {
    ID            int64  `json:"id" gorm:"primaryKey"`
    FromUserID    int64  `json:"from_user_id" gorm:"index"`
    ToUserID      int64  `json:"to_user_id" gorm:"index"`
    ApplicationID int64  `json:"application_id" gorm:"index"`
    Rating        int    `json:"rating"`
    Comment       string `json:"comment"`
}

type Document struct {
    ID            int64  `json:"id" gorm:"primaryKey"`
    ApplicationID int64  `json:"application_id" gorm:"index"`
    Name          string `json:"name"`
    Path          string `json:"path"`
}

type ApplicationView struct {
    Application *Application `json:"application"`
    Student     *User        `json:"student"`
    Project     *Project     `json:"project"`
    Score       float64      `json:"score"`
}

type ApplicationAnalysis struct {
    Application *Application `json:"application"`
    Student     *User        `json:"student"`
    Project     *Project     `json:"project"`
    Score       float64      `json:"score"`
    Reason      string       `json:"reason"`
}

type MatchResult struct {
    Project *Project `json:"project"`
    Score   float64  `json:"score"`
    Reason  string   `json:"reason"`
}

type Matcher interface {
    Match(student *User, projects []*Project) []MatchResult
}
