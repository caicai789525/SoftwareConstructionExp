package ioc

import (
    "github.com/bugoutianzhen123/SoftwareConstructionExp/config"
    "github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

func NewGormDB() *gorm.DB {
    cfg, err := config.Load()
    if err != nil { panic(err) }
    if cfg.Database == "" { panic("missing mysql dsn in config") }
    db, err := gorm.Open(mysql.Open(cfg.Database), &gorm.Config{})
    if err != nil { panic(err) }
    if err := db.AutoMigrate(&domain.User{}, &domain.Project{}, &domain.Application{}, &domain.Tracking{}, &domain.Feedback{}, &domain.Document{}); err != nil {
        panic(err)
    }
    return db
}