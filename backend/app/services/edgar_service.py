import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup, Tag
import pandas as pd
from datetime import datetime
import logging
import time
from typing import List, Dict, Optional, Union
import os
from dotenv import load_dotenv
import re
from fastapi import HTTPException
import sys

# 配置日志记录
try:
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
    os.makedirs(log_dir, exist_ok=True)

    # 创建日志记录器
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    # 创建文件处理器
    log_file = os.path.join(log_dir, 'edgar_service.log')
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

load_dotenv()

class EDGARService:
    def __init__(self):
        """
        初始化EDGAR服务
        """
        self.base_url = "https://www.sec.gov/Archives"
        self.headers = {
            'User-Agent': 'Hedge Fund Analytics research@example.com',
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'www.sec.gov'
        }
        self.request_delay = 0.1  # 100ms between requests to comply with SEC rate limit
        self.logger = logger

    def _make_request(self, url: str, params: dict = None) -> requests.Response:
        """
        发送请求到SEC，包含重试逻辑和速率限制
        """
        max_retries = 3
        retry_delay = 1  # 初始重试延迟（秒）
        
        headers = {
            'User-Agent': 'Hedge Fund Analytics research@example.com',
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'www.sec.gov' if 'sec.gov' in url else None
        }
        headers = {k: v for k, v in headers.items() if v is not None}
        
        for attempt in range(max_retries):
            try:
                # 添加延迟以遵守SEC的速率限制
                time.sleep(self.request_delay)
                
                response = requests.get(url, params=params, headers=headers, timeout=30)
                
                # 检查响应状态
                if response.status_code == 200:
                    return response
                elif response.status_code == 429:  # 速率限制
                    wait_time = int(response.headers.get('Retry-After', 60))
                    self.logger.warning(f"达到速率限制，等待 {wait_time} 秒")
                    time.sleep(wait_time)
                    continue
                elif response.status_code == 404:
                    self.logger.error(f"资源未找到: {url}")
                    raise HTTPException(status_code=404, detail="Resource not found")
                else:
                    self.logger.error(f"请求失败 ({response.status_code}): {url}")
                    response.raise_for_status()
                    
            except requests.RequestException as e:
                self.logger.error(f"请求出错 (尝试 {attempt + 1}/{max_retries}): {str(e)}")
                if attempt == max_retries - 1:  # 最后一次尝试
                    raise HTTPException(status_code=500, detail=f"Failed to fetch data from SEC: {str(e)}")
                    
                # 指数退避
                time.sleep(retry_delay * (2 ** attempt))
                
        raise HTTPException(status_code=500, detail="Maximum retries exceeded")

    def parse_13f_xml(self, xml_url: str) -> pd.DataFrame:
        """解析13F XML文件并返回持仓数据DataFrame"""
        try:
            # 获取XML内容
            response = self._make_request(xml_url)
            soup = BeautifulSoup(response.text, 'xml')
            
            # 查找所有命名空间
            namespaces = self._get_namespaces(soup)
            self.logger.info(f"找到的命名空间: {namespaces}")
            
            # 尝试不同的标签组合
            holdings_data = []
            rank = 1
            
            # 定义可能的标签名组合
            info_table_tags = ['informationTable', 'ns1:informationTable']
            info_table_entry_tags = ['infoTableEntry', 'ns1:infoTableEntry']
            
            # 查找信息表
            info_table = None
            for tag in info_table_tags:
                info_table = soup.find(tag)
                if info_table:
                    break
            
            if not info_table:
                raise ValueError("无法找到informationTable标签")
            
            # 遍历每个条目
            for tag in info_table_entry_tags:
                entries = info_table.find_all(tag)
                if entries:
                    for entry in entries:
                        holding = self._parse_holding_entry(entry, namespaces, rank)
                        holdings_data.append(holding)
                        rank += 1
                    break
            
            if not holdings_data:
                raise ValueError("未找到任何持仓数据")
            
            # 创建DataFrame并计算额外的指标
            df = pd.DataFrame(holdings_data)
            
            # 计算投资组合百分比
            total_value = df['value'].sum()
            df['percentOfPortfolio'] = (df['value'] / total_value * 100).round(2)
            
            # 计算平均价格
            df['averagePrice'] = (df['value'] * 1000 / df['shares']).round(2)
            
            return df
            
        except Exception as e:
            self.logger.error(f"解析XML文件失败: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to parse XML file: {str(e)}")

    def _get_namespaces(self, soup: BeautifulSoup) -> Dict[str, str]:
        """从XML文档中提取命名空间"""
        try:
            namespaces = {}
            for tag in soup.find_all():
                for attr in tag.attrs:
                    if attr.startswith('xmlns:'):
                        prefix = attr.split(':')[1]
                        namespaces[prefix] = tag[attr]
            return namespaces
        except Exception as e:
            self.logger.warning(f"提取命名空间时出错: {str(e)}")
            return {}

    def _parse_holding_entry(self, entry: Tag, namespaces: Dict[str, str], rank: int) -> Dict:
        """解析单个持仓条目"""
        try:
            # 定义可能的标签名前缀
            prefixes = ['', 'ns1:', 'ns2:']
            
            def get_tag_value(tag_name: str) -> str:
                """尝试使用不同的前缀获取标签值"""
                for prefix in prefixes:
                    tag = entry.find(f"{prefix}{tag_name}")
                    if tag:
                        return tag.text.strip()
                return ""
            
            # 提取基本信息
            holding = {
                'rank': rank,
                'nameOfIssuer': get_tag_value('nameOfIssuer'),
                'titleOfClass': get_tag_value('titleOfClass'),
                'cusip': get_tag_value('cusip'),
                'value': float(get_tag_value('value') or 0),
                'shares': float(get_tag_value('sshPrnamt') or 0),
                'shareType': get_tag_value('sshPrnamtType'),
                'investmentDiscretion': get_tag_value('investmentDiscretion'),
                'otherManager': get_tag_value('otherManager'),
            }
            
            # 提取投票权信息
            voting_authority = entry.find('votingAuthority') or entry.find('ns1:votingAuthority')
            if voting_authority:
                holding.update({
                    'sole_voting': int(get_tag_value('Sole') or 0),
                    'shared_voting': int(get_tag_value('Shared') or 0),
                    'no_voting': int(get_tag_value('None') or 0),
                })
            else:
                holding.update({
                    'sole_voting': 0,
                    'shared_voting': 0,
                    'no_voting': 0,
                })
            
            return holding
            
        except Exception as e:
            self.logger.error(f"解析持仓条目时出错: {str(e)}")
            raise ValueError(f"Failed to parse holding entry: {str(e)}")

    def validate_cik(self, cik: str) -> str:
        """验证并格式化CIK"""
        try:
            # 移除所有非数字字符
            cik = ''.join(filter(str.isdigit, str(cik)))
            
            if not cik:
                raise ValueError("CIK must contain numbers")
            
            if len(cik) > 10:
                raise ValueError("CIK cannot be longer than 10 digits")
            
            # 补齐10位
            return cik.zfill(10)
            
        except Exception as e:
            raise ValueError(f"Invalid CIK format: {str(e)}")

    def validate_year(self, year: int) -> int:
        """验证年份是否有效"""
        try:
            year = int(year)
            current_year = datetime.now().year
            
            if year < 1993 or year > current_year:
                raise ValueError(f"Year must be between 1993 and {current_year}")
            
            return year
            
        except ValueError as e:
            raise ValueError(f"Invalid year format: {str(e)}")
        except Exception as e:
            raise ValueError(f"Invalid year: {str(e)}")

    def get_13f_filings(self, cik: str, year: int) -> List[Dict]:
        """
        获取指定CIK和年份的13F文件列表
        """
        try:
            # 验证输入
            cik = self.validate_cik(cik)
            self.validate_year(year)
            
            self.logger.info(f"获取 {cik} 在 {year} 年的13F文件")
            
            # 构建SEC公司提交历史的API URL
            submissions_url = f"https://data.sec.gov/submissions/CIK{cik}.json"
            self.logger.info(f"请求提交历史: {submissions_url}")
            
            # 获取提交历史
            response = self._make_request(submissions_url)
            data = response.json()
            
            # 从最近的文件开始处理
            filings = []
            recent_filings = data.get('filings', {}).get('recent', {})
            
            if not recent_filings:
                self.logger.warning(f"未找到 {cik} 的提交记录")
                return []
                
            # 获取所有字段的列表
            form_types = recent_filings.get('form', [])
            filing_dates = recent_filings.get('filingDate', [])
            accession_numbers = recent_filings.get('accessionNumber', [])
            primary_docs = recent_filings.get('primaryDocument', [])
            filing_urls = recent_filings.get('url', [])
            
            # 遍历所有文件
            for i in range(len(form_types)):
                try:
                    form = form_types[i]
                    filing_date = filing_dates[i]
                    accession_number = accession_numbers[i]
                    primary_doc = primary_docs[i]
                    filing_url = filing_urls[i] if filing_urls else None
                    
                    # 只处理13F-HR文件
                    if form not in ['13F-HR', '13F-HR/A']:
                        continue
                        
                    # 检查年份
                    file_year = int(filing_date.split('-')[0])
                    if file_year != year:
                        continue
                    
                    # 构建XML URL
                    # SEC的文件结构：https://www.sec.gov/Archives/edgar/data/CIK/ACCESSION/primary_doc
                    formatted_accession = accession_number.replace('-', '')
                    xml_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{formatted_accession}/{primary_doc}"
                    
                    filing = {
                        'date': filing_date,
                        'accessionNumber': accession_number,
                        'primaryDocument': primary_doc,
                        'xmlUrl': xml_url,
                        'formUrl': f"https://www.sec.gov/Archives/edgar/data/{cik}/{formatted_accession}",
                        'isAmended': form == '13F-HR/A'
                    }
                    
                    filings.append(filing)
                    
                except Exception as e:
                    self.logger.error(f"处理文件记录时出错: {str(e)}")
                    continue
            
            # 按日期降序排序
            filings.sort(key=lambda x: x['date'], reverse=True)
            
            self.logger.info(f"找到 {len(filings)} 个13F文件")
            return filings
            
        except Exception as e:
            self.logger.error(f"获取13F文件列表时出错: {str(e)}")
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(status_code=500, detail=str(e))

    def get_fund_holdings(self, cik: str, year: int) -> pd.DataFrame:
        """获取基金在指定年份的所有持仓数据"""
        try:
            # 获取13F文件列表
            filings = self.get_13f_filings(cik, year)
            
            if not filings:
                raise HTTPException(status_code=404, detail=f"No 13F filings found for {cik} in {year}")
            
            # 获取最新的文件
            latest_filing = filings[0]  # 文件已按日期降序排序
            self.logger.info(f"处理最新的13F文件: {latest_filing['date']}")
            
            try:
                # 解析XML文件
                holdings_df = self.parse_13f_xml(latest_filing['xmlUrl'])
                
                # 添加文件日期信息
                holdings_df['filingDate'] = latest_filing['date']
                holdings_df['isAmended'] = latest_filing['isAmended']
                
                # 添加基金信息
                holdings_df['fundCik'] = cik
                
                # 重新排序列
                columns = [
                    'rank', 'nameOfIssuer', 'titleOfClass', 'cusip', 'value', 
                    'shares', 'shareType', 'percentOfPortfolio', 'averagePrice',
                    'investmentDiscretion', 'otherManager', 'sole_voting', 
                    'shared_voting', 'no_voting', 'filingDate', 'isAmended', 'fundCik'
                ]
                holdings_df = holdings_df[columns]
                
                return holdings_df
                
            except Exception as e:
                self.logger.error(f"处理文件时出错: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to process filing: {str(e)}")
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error(f"获取基金持仓数据时出错: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def enrich_holdings_data(self, holdings_df: pd.DataFrame) -> pd.DataFrame:
        """
        使用额外的市场数据丰富持仓数据
        """
        try:
            if holdings_df.empty:
                return holdings_df
                
            # 计算基本指标
            total_value = holdings_df['value'].sum()
            
            # 添加分析指标
            holdings_df['averagePrice'] = (holdings_df['value'] / holdings_df['shares']).round(2)
            holdings_df['percentOfPortfolio'] = (holdings_df['value'] / total_value * 100).round(2)
            
            # 按持仓市值排序并添加排名
            holdings_df = holdings_df.sort_values('value', ascending=False)
            holdings_df['rank'] = range(1, len(holdings_df) + 1)
            
            # 添加分类
            holdings_df['sizeCategory'] = pd.qcut(holdings_df['value'], 
                                                q=4, 
                                                labels=['Small', 'Medium', 'Large', 'Very Large'])
            
            # 计算汇总统计
            self.logger.info(f"Portfolio Statistics:")
            self.logger.info(f"Total Holdings: {len(holdings_df)}")
            self.logger.info(f"Total Value: ${total_value:,.2f}")
            self.logger.info(f"Largest Position: {holdings_df.iloc[0]['nameOfIssuer']} (${holdings_df.iloc[0]['value']:,.2f})")
            
            return holdings_df
            
        except Exception as e:
            self.logger.error(f"Error enriching holdings data: {str(e)}")
            return holdings_df
