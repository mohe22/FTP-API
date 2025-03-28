


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.utils import add_default_data,initialize_database
from routes.admin.main import router as admin_router
from config import Config
from routes import auth
from routes import files

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.FRONTEND_URL,  
    allow_credentials=True,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)
app.include_router(auth.router, prefix="/api/ftp/auth")
app.include_router(files.router, prefix="/api/ftp/files")
app.include_router(admin_router)

initialize_database()
add_default_data()

@app.get("/")
async def root():
 
    return {"message": "Hello World"}
