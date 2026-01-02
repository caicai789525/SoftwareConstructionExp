package config

import (
    "os"
    "path/filepath"
    "gopkg.in/yaml.v3"
)

type AppConfig struct {
    Database string `yaml:"database"`
    OpenAI   OpenAIConfig `yaml:"openai_api"`
}

type OpenAIConfig struct {
    DeepseekAPIKey string `yaml:"deepseek_api_key"`
    BaseURL        string `yaml:"base_url"`
    Model          string `yaml:"model"`
}

func Load() (*AppConfig, error) {
    p := filepath.Join("config", "config.yaml")
    b, err := os.ReadFile(p)
    if err != nil { return nil, err }
    var c AppConfig
    if err := yaml.Unmarshal(b, &c); err != nil { return nil, err }
    return &c, nil
}
