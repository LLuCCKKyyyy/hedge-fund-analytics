import os
import sys
from pathlib import Path
import unittest
from unittest.mock import Mock, patch
import pandas as pd
from bs4 import BeautifulSoup

# 添加backend目录到Python路径
project_root = Path(__file__).parent.parent.absolute()
backend_dir = project_root / 'backend'
sys.path.insert(0, str(backend_dir))

from app.services.edgar_service import EDGARService

class TestEDGARService(unittest.TestCase):
    def setUp(self):
        self.edgar_service = EDGARService()
        
    def test_validate_cik(self):
        """测试CIK验证功能"""
        # 测试有效的CIK
        self.assertEqual(self.edgar_service.validate_cik("1234567"), "0001234567")
        self.assertEqual(self.edgar_service.validate_cik("0001234567"), "0001234567")
        
        # 测试无效的CIK
        with self.assertRaises(ValueError):
            self.edgar_service.validate_cik("")
        with self.assertRaises(ValueError):
            self.edgar_service.validate_cik("abc")
        with self.assertRaises(ValueError):
            self.edgar_service.validate_cik("12345678901")  # 超过10位
            
    def test_validate_year(self):
        """测试年份验证功能"""
        # 测试有效的年份
        self.assertEqual(self.edgar_service.validate_year(2020), 2020)
        self.assertEqual(self.edgar_service.validate_year(1993), 1993)
        
        # 测试无效的年份
        with self.assertRaises(ValueError):
            self.edgar_service.validate_year(1992)  # 早于1993
        with self.assertRaises(ValueError):
            self.edgar_service.validate_year(2025)  # 未来年份
            
    @patch('app.services.edgar_service.requests.get')
    def test_parse_13f_xml(self, mock_get):
        """测试13F XML解析功能"""
        # 模拟XML响应
        mock_response = Mock()
        mock_response.text = """<?xml version="1.0" encoding="UTF-8"?>
        <informationTable>
            <infoTableEntry>
                <nameOfIssuer>APPLE INC</nameOfIssuer>
                <titleOfClass>COM</titleOfClass>
                <cusip>037833100</cusip>
                <value>1000000</value>
                <sshPrnamt>5000</sshPrnamt>
                <sshPrnamtType>SH</sshPrnamtType>
                <investmentDiscretion>SOLE</investmentDiscretion>
                <votingAuthority>
                    <Sole>5000</Sole>
                    <Shared>0</Shared>
                    <None>0</None>
                </votingAuthority>
            </infoTableEntry>
        </informationTable>
        """
        mock_get.return_value = mock_response
        
        # 测试解析结果
        df = self.edgar_service.parse_13f_xml("http://test.url")
        
        # 验证解析结果
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['nameOfIssuer'], 'APPLE INC')
        self.assertEqual(df.iloc[0]['cusip'], '037833100')
        self.assertEqual(df.iloc[0]['value'], 1000000)
        self.assertEqual(df.iloc[0]['shares'], 5000)
        
    @patch('app.services.edgar_service.requests.get')
    def test_get_fund_holdings(self, mock_get):
        """测试获取基金持仓功能"""
        # 模拟API响应
        mock_get.side_effect = [
            # 第一个响应：文件列表
            Mock(json=lambda: {
                'filings': [{
                    'date': '2023-12-31',
                    'accessionNumber': '0001234567-23-000123',
                    'xmlUrl': 'http://test.url/xml',
                    'isAmended': False
                }]
            }),
            # 第二个响应：XML内容
            Mock(text="""<?xml version="1.0" encoding="UTF-8"?>
            <informationTable>
                <infoTableEntry>
                    <nameOfIssuer>APPLE INC</nameOfIssuer>
                    <titleOfClass>COM</titleOfClass>
                    <cusip>037833100</cusip>
                    <value>1000000</value>
                    <sshPrnamt>5000</sshPrnamt>
                    <sshPrnamtType>SH</sshPrnamtType>
                    <investmentDiscretion>SOLE</investmentDiscretion>
                    <votingAuthority>
                        <Sole>5000</Sole>
                        <Shared>0</Shared>
                        <None>0</None>
                    </votingAuthority>
                </infoTableEntry>
            </informationTable>
            """)
        ]
        
        # 测试获取持仓
        df = self.edgar_service.get_fund_holdings("0001234567", 2023)
        
        # 验证结果
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['nameOfIssuer'], 'APPLE INC')
        self.assertEqual(df.iloc[0]['filingDate'], '2023-12-31')
        self.assertEqual(df.iloc[0]['isAmended'], False)
        
    def test_get_namespaces(self):
        """测试命名空间提取功能"""
        # 创建测试XML
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <root xmlns:ns1="http://test.com/ns1" xmlns:ns2="http://test.com/ns2">
            <ns1:element>Test</ns1:element>
        </root>
        """
        soup = BeautifulSoup(xml, 'xml')
        
        # 测试命名空间提取
        namespaces = self.edgar_service._get_namespaces(soup)
        
        # 验证结果
        self.assertEqual(len(namespaces), 2)
        self.assertEqual(namespaces['ns1'], 'http://test.com/ns1')
        self.assertEqual(namespaces['ns2'], 'http://test.com/ns2')
        
    def test_parse_holding_entry(self):
        """测试持仓条目解析功能"""
        # 创建测试XML
        xml = """
        <infoTableEntry>
            <nameOfIssuer>APPLE INC</nameOfIssuer>
            <titleOfClass>COM</titleOfClass>
            <cusip>037833100</cusip>
            <value>1000000</value>
            <sshPrnamt>5000</sshPrnamt>
            <sshPrnamtType>SH</sshPrnamtType>
            <investmentDiscretion>SOLE</investmentDiscretion>
            <votingAuthority>
                <Sole>5000</Sole>
                <Shared>0</Shared>
                <None>0</None>
            </votingAuthority>
        </infoTableEntry>
        """
        soup = BeautifulSoup(xml, 'xml')
        entry = soup.find('infoTableEntry')
        
        # 测试解析
        holding = self.edgar_service._parse_holding_entry(entry, {}, 1)
        
        # 验证结果
        self.assertEqual(holding['rank'], 1)
        self.assertEqual(holding['nameOfIssuer'], 'APPLE INC')
        self.assertEqual(holding['cusip'], '037833100')
        self.assertEqual(holding['value'], 1000000)
        self.assertEqual(holding['shares'], 5000)
        self.assertEqual(holding['sole_voting'], 5000)

if __name__ == '__main__':
    unittest.main()
