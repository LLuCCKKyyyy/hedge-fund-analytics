from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, validator
from datetime import datetime
from app.services.edgar_service import EDGARService
import pandas as pd
import logging
import sys
import os

# 配置日志记录
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
os.makedirs(log_dir, exist_ok=True)

# 创建日志记录器
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 创建文件处理器
file_handler = logging.FileHandler(os.path.join(log_dir, 'edgar_router.log'), encoding='utf-8')
file_handler.setLevel(logging.DEBUG)

# 创建控制台处理器
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)

# 创建格式化器
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# 添加处理器到日志记录器
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# 防止日志重复
logger.propagate = False

router = APIRouter()
edgar_service = EDGARService()

class HoldingData(BaseModel):
    rank: int = Field(..., description="持仓排名")
    nameOfIssuer: str = Field(..., description="发行人名称")
    titleOfClass: str = Field(..., description="证券类别")
    cusip: str = Field(..., description="CUSIP编号")
    value: int = Field(..., description="持仓市值（美元）")
    shares: int = Field(..., description="持仓数量")
    shareType: str = Field(..., description="股份类型")
    putCall: Optional[str] = Field(None, description="期权类型（如适用）")
    investmentDiscretion: str = Field(..., description="投资决策权")
    otherManager: Optional[str] = Field(None, description="其他管理人")
    filingDate: str = Field(..., description="申报日期")
    averagePrice: float = Field(..., description="平均价格")
    percentOfPortfolio: float = Field(..., description="投资组合占比（%）")
    isAmended: bool = Field(False, description="是否为修正文件")

    @validator('cusip')
    def validate_cusip(cls, v):
        if not v or len(v) != 9:
            raise ValueError('CUSIP must be 9 characters')
        return v

class FilingData(BaseModel):
    date: str = Field(..., description="申报日期")
    accessionNumber: str = Field(..., description="SEC访问编号")
    primaryDocument: str = Field(..., description="主要文档名称")
    xmlUrl: str = Field(..., description="XML文档URL")
    isAmended: bool = Field(False, description="是否为修正文件")

    @validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Invalid date format, should be YYYY-MM-DD')
        return v

@router.get("/holdings/{cik}/{year}", response_model=List[HoldingData])
async def get_fund_holdings(request: Request, cik: str, year: int):
    """
    获取指定基金和年份的持仓数据
    
    参数:
    - cik: SEC CIK编号
    - year: 年份 (1993-当前)
    
    返回:
    - 持仓数据列表，按市值降序排序
    """
    try:
        logger.info(f"Processing holdings request for CIK {cik}, year {year}")
        logger.debug(f"Request headers: {request.headers}")
        
        # 验证输入参数
        if not cik or not cik.strip():
            raise HTTPException(status_code=400, detail="CIK is required")
        if not year or year < 1993 or year > datetime.now().year:
            raise HTTPException(status_code=400, detail=f"Year must be between 1993 and {datetime.now().year}")
        
        holdings_df = edgar_service.get_fund_holdings(cik, year)
        
        if holdings_df is None or holdings_df.empty:
            logger.warning(f"No holdings data found for CIK {cik} in year {year}")
            raise HTTPException(status_code=404, detail="No holdings data found")
        
        # 丰富数据
        try:
            holdings_df = edgar_service.enrich_holdings_data(holdings_df)
        except Exception as e:
            logger.error(f"Error enriching holdings data: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error processing holdings data")
        
        # 转换为JSON格式
        try:
            holdings_list = holdings_df.to_dict('records')
            logger.info(f"Successfully processed {len(holdings_list)} holdings")
            return holdings_list
        except Exception as e:
            logger.error(f"Error converting holdings to JSON: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error formatting response data")
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_fund_holdings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/filings/{cik}/{year}", response_model=List[FilingData])
async def get_filings(request: Request, cik: str, year: int):
    """
    获取指定基金和年份的13F文件列表
    
    参数:
    - cik: SEC CIK编号
    - year: 年份 (1993-当前)
    
    返回:
    - 13F文件列表，按日期降序排序
    """
    try:
        logger.info(f"Processing filings request for CIK {cik}, year {year}")
        logger.debug(f"Request headers: {request.headers}")
        
        # 验证输入参数
        if not cik or not cik.strip():
            raise HTTPException(status_code=400, detail="CIK is required")
        if not year or year < 1993 or year > datetime.now().year:
            raise HTTPException(status_code=400, detail=f"Year must be between 1993 and {datetime.now().year}")
        
        filings = edgar_service.get_13f_filings(cik, year)
        
        if not filings:
            logger.warning(f"No filings found for CIK {cik} in year {year}")
            raise HTTPException(status_code=404, detail="No filings found")
            
        logger.info(f"Successfully retrieved {len(filings)} filings")
        return filings
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_filings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
