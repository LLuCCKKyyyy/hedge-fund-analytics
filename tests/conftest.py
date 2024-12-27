import os
import sys
from pathlib import Path

# 获取项目根目录
project_root = Path(__file__).parent.parent.absolute()

# 添加backend目录到Python路径
backend_dir = project_root / 'backend'
sys.path.insert(0, str(backend_dir))
