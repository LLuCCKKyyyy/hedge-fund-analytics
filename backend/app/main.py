from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import edgar
from app.api.endpoints import auth
from app.core.config import settings
from app.models.user import Base
from app.db.session import engine
import logging
import sys
import os
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# 配置日志记录
try:
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)

    # 创建日志记录器
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    # 创建文件处理器
    log_file = os.path.join(log_dir, 'api.log')
    try:
        # 测试文件是否可写
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write('')
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
    except Exception as e:
        print(f"Warning: Could not create file handler: {str(e)}")
        file_handler = None

    # 创建控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    # 创建格式化器
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    if file_handler:
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 防止日志重复
    logger.propagate = False

except Exception as e:
    print(f"Warning: Failed to configure logging: {str(e)}")
    # 创建一个基本的控制台日志记录器
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    logger.propagate = False

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for analyzing hedge fund holdings and strategies",
    version=settings.VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP error occurred: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Include routers
app.include_router(edgar.router, prefix="/api/v1/edgar", tags=["edgar"])
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to Hedge Fund Analytics API"}

@app.get("/api/v1/funds")
async def get_funds():
    try:
        # Temporary mock data
        return {
            "funds": [
                {
                    "id": 1,
                    "name": "Citadel Advisors LLC",
                    "manager": "Kenneth Griffin",
                    "cik": "0001423053",
                    "aum": 234000000000
                },
                {
                    "id": 2,
                    "name": "Renaissance Technologies",
                    "manager": "James Simons",
                    "cik": "0001037389",
                    "aum": 130000000000
                },
                {
                    "id": 3,
                    "name": "Bridgewater Associates",
                    "manager": "Ray Dalio",
                    "cik": "0001350694",
                    "aum": 140000000000
                }
            ]
        }
    except Exception as e:
        logger.error(f"Error in get_funds: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
