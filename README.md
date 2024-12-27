# 对冲基金分析平台 (Hedge Fund Analytics Platform)

## 🚀 项目简介

对冲基金13F持仓分析的Web应用

### 🎯 主要功能

- 实时对冲基金持仓分析
- 投资组合性能指标追踪
- 行业和板块投资趋势可视化
- 历史投资表现对比
- 投资风险评估

## 📊 技术栈

### 前端
- React (v18.2.0)
- TypeScript
- Ant Design
- ECharts
- React Router

### 后端
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### 数据分析
- Pandas
- NumPy
- Scikit-learn

## 🛠 项目架构

\`\`\`
hedge-fund-analytics/
│
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── api/             # API接口
│   │   ├── core/            # 核心配置
│   │   ├── models/          # 数据模型
│   │   └── services/        # 业务逻辑
│   └── tests/               # 后端测试
│
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # 前端服务
│   │   └── utils/           # 工具函数
│   └── tests/               # 前端测试
│
└── docs/                    # 项目文档
\`\`\`

## 🚀 快速开始

### 前提条件
- Node.js (v16+)
- Python (v3.9+)
- pip
- npm

### 本地开发

1. 克隆仓库
\`\`\`bash
git clone https://github.com/LLuCCKKyyyy/hedge-fund-analytics.git
cd hedge-fund-analytics
\`\`\`

2. 设置后端环境
\`\`\`bash


cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

3. 设置前端环境
\`\`\`bash
cd ../frontend
npm install
\`\`\`

4. 启动开发服务器

后端:
\`\`\`bash
cd ../backend
uvicorn app.main:app --reload
\`\`\`

前端:
\`\`\`bash
cd ../frontend
npm start
\`\`\`

## 📄 项目交接

详细的项目交接文档请查看 [HANDOVER.md](HANDOVER.md)。该文档包含：
- 项目概述
- 技术栈
- 开发阶段
- 关键功能
- 本地开发指南
- 待办事项
