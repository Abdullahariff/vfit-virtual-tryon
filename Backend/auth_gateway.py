import os
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()

security = HTTPBearer()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

async def verify_supabase_token(credentials: HTTPAuthorizationCredentials=Depends(security)):
    token = credentials.credentials
    
    try:
        user_response= supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token or user session has expired.")
        
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")