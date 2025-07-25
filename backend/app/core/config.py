from pydantic import Field
from pathlib import Path
from pydantic_settings import BaseSettings
import os 
class Settings(BaseSettings):
    # General
    PROJECT_NAME: str = "UMKM AI App"
    API_V1_STR: str = "/api/v1"

    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"

    # Google Cloud
    GOOGLE_APPLICATION_CREDENTIALS: str = Field(..., env="GOOGLE_APPLICATION_CREDENTIALS")

    # OpenAI
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    class Config:
        env_file = str(Path(__file__).parent.parent.parent / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
# Fix relative path issue
google_cred_path = Path(settings.GOOGLE_APPLICATION_CREDENTIALS)
if not google_cred_path.is_absolute():
    # Convert to absolute path relative to project root
    settings.GOOGLE_APPLICATION_CREDENTIALS = str((Path(__file__).parents[2] / google_cred_path).resolve())
    print(f"Using Google credentials from: {settings.GOOGLE_APPLICATION_CREDENTIALS}")
