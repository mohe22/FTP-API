


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.utils import add_default_data,initialize_database
from routes.admin.main import router as admin_router

from routes import auth
from routes import files

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.0.72:5173","http://localhost:5173"],  # Specify allowed origins
    allow_credentials=True,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)
app.include_router(auth.router, prefix="/api/ftp/auth")
app.include_router(files.router, prefix="/api/ftp/files")
app.include_router(admin_router)
@app.get("/")
async def root():
    initialize_database()
    add_default_data()

    return {"message": "Hello World"}
