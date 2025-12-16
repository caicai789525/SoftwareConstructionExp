package main

import (
	"log"
	"net/http"
	"time"

	"os"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/config"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/handle"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/ioc"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/repository"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/router"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/service"
)

func main() {
    db := ioc.NewGormDB()
    repo := repository.NewRepo(db)
    var matcher domain.Matcher = service.SimpleMatcher{}
    if os.Getenv("SC_LLM_ENABLE") == "1" {
        if m, err := service.NewLLMMatcher(); err == nil { matcher = m }
    } else {
        if cfg, err := config.Load(); err == nil && cfg.OpenAI.DeepseekAPIKey != "" {
            if m, err := service.NewLLMMatcher(); err == nil { matcher = m }
        }
    }
    svc := service.NewService(repo, matcher)
    h := handle.NewHandlers(svc)
    ah := handle.NewAuthHandlers(svc)
    r := router.NewRouter(h, ah, repo)
    log.Println("listening on :8080")
    s := &http.Server{
        Addr:         ":8080",
        Handler:      r,
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 10 * time.Second,
    }
    log.Fatal(s.ListenAndServe())
    //r.Run(":8080")
}
