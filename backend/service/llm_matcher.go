package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/bugoutianzhen123/SoftwareConstructionExp/config"
	"github.com/bugoutianzhen123/SoftwareConstructionExp/domain"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
)

type LLMMatcher struct{ llm llms.Model }

func NewLLMMatcher() (domain.Matcher, error) {
    cfg, _ := config.Load()
    model := os.Getenv("SC_LLM_MODEL")
    if model == "" {
        if cfg != nil && cfg.OpenAI.Model != "" { model = cfg.OpenAI.Model } else { model = "deepseek-chat" }
    }
    baseURL := os.Getenv("SC_LLM_BASE_URL")
    if baseURL == "" {
        if cfg != nil && cfg.OpenAI.BaseURL != "" { baseURL = cfg.OpenAI.BaseURL } else { baseURL = "https://api.deepseek.com/v1" }
    }
    if os.Getenv("OPENAI_API_KEY") == "" {
        if cfg != nil && cfg.OpenAI.DeepseekAPIKey != "" { os.Setenv("OPENAI_API_KEY", cfg.OpenAI.DeepseekAPIKey) }
    }
    var opts []openai.Option
    opts = append(opts, openai.WithModel(model))
    if baseURL != "" { opts = append(opts, openai.WithBaseURL(baseURL)) }
    m, err := openai.New(opts...)
    if err != nil { return nil, err }
    return &LLMMatcher{llm: m}, nil
}

func (l *LLMMatcher) Match(student *domain.User, projects []*domain.Project) []domain.MatchResult {
    var out []domain.MatchResult
    for _, p := range projects {
        prompt := buildPrompt(student, p)
        ctx := context.Background()
        resp, err := l.llm.Call(ctx, prompt, llms.WithTemperature(0))
        if err != nil || resp == "" {
            out = append(out, domain.MatchResult{Project: p, Score: 0, Reason: "LLM错误或无响应"})
            continue
        }
        var r struct{ Score float64 `json:"score"`; Reason string `json:"reason"` }
        txt := resp
        if e := json.Unmarshal([]byte(txt), &r); e != nil {
            r.Score = 0
            r.Reason = strings.TrimSpace(txt)
        }
        if r.Score < 0 { r.Score = 0 } else if r.Score > 1 { r.Score = 1 }
        out = append(out, domain.MatchResult{Project: p, Score: r.Score, Reason: r.Reason})
    }
    return out
}

func buildPrompt(stu *domain.User, p *domain.Project) string {
    return fmt.Sprintf("请基于以下信息进行科研需求与学生能力的语义匹配，并返回JSON：{\"score\":0..1浮点, \"reason\":中文理由}. 学生技能: %s; 项目标题: %s; 项目描述: %s; 项目要求: %s", strings.Join(stu.Skills, ", "), p.Title, p.Description, strings.Join(p.Requirements, ", "))
}
