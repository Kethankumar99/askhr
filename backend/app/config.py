from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AskHR"
    APP_VERSION: str = "1.0.0"
    SECRET_KEY: str = "askhr-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./data/askhr.db"
    
    class Config:
        env_file = ".env"

settings = Settings()