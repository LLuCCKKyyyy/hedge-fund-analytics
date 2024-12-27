# 项目交接文档

## 🔗 项目仓库
GitHub地址：https://github.com/LLuCCKKyyyy/hedge-fund-analytics

## 🚀 项目概述
对冲基金13F持仓分析的Web应用，旨在提供深入的投资组合分析和可视化工具。

## 🛠 技术栈
### 前端
- React (v18.2.0)
- TypeScript
- Ant Design
- ECharts

### 后端
- Python
- FastAPI
- SQLAlchemy
- Pydantic

## 🎯 当前开发阶段
- 基础框架已搭建
- 核心功能开发中
- 数据分析模块进行中

## 🔑 关键功能
- 实时对冲基金持仓分析
- 投资组合性能指标追踪
- 行业和板块投资趋势可视化

## 📋 待办事项
1. 完善数据分析算法
2. 优化前端可视化组件
3. 增加更多数据源支持
4. 完善用户认证系统

## 💻 本地开发准备

### 前提条件
- Node.js (v16+)
- Python (v3.9+)
- pip
- npm

### 环境配置
1. 克隆仓库
\`\`\`bash
git clone https://github.com/LLuCCKKyyyy/hedge-fund-analytics.git
cd hedge-fund-analytics
\`\`\`

2. 后端环境
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

3. 前端环境
\`\`\`bash
cd ../frontend
npm install
\`\`\`

### 启动开发服务器
1. 后端服务
\`\`\`bash
cd backend
uvicorn app.main:app --reload
\`\`\`

2. 前端服务
\`\`\`bash
cd frontend
npm start
\`\`\`

## 🔐 环境变量
创建 \`.env\` 文件，配置：
- \`DATABASE_URL\`
- \`SECRET_KEY\`
- \`API_KEY\`

## 🚧 已知问题
- localhost连接问题：前端网页打不开
- 部分数据分析功能未完全实现
- 需要优化性能和错误处理
EOF