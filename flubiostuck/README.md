# FluBioStack - Web Platform

FluBioStack 是一个基于 Next.js 的生物信息学数据分析与可视化平台，提供流感病毒数据库查询、基因序列分析、社区论坛等功能。

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **可视化**: ECharts
- **部署**: Docker / Standalone

## 📁 项目结构

```
flubiostuck/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── analysis/     # 数据分析页面
│   │   ├── database/     # 数据库查询页面
│   │   ├── forum/        # 社区论坛
│   │   └── api/          # API 路由
│   ├── components/       # React 组件
│   │   ├── ui/           # UI 基础组件
│   │   ├── home/         # 首页组件
│   │   ├── layout/       # 布局组件
│   │   └── visualization/ # 可视化组件
│   ├── lib/              # 工具函数和状态管理
│   ├── styles/           # 全局样式
│   └── types/            # TypeScript 类型定义
├── public/               # 静态资源
│   ├── images/           # 图片
│   └── patterns/         # SVG 图案
├── Dockerfile            # Docker 构建配置
└── package.json          # 项目依赖
```

## 🛠️ 安装与运行

### 前置要求

- Node.js >= 18.x
- npm >= 9.x

### 1. 安装依赖

```bash
npm install
```

### 2. 开发环境运行

```bash
# Windows
start.bat

# Linux/macOS
chmod +x start.sh
./start.sh
```

或直接使用 npm 命令：

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 3. 生产环境构建

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 4. Docker 部署

```bash
# 构建镜像
docker build -t flubiostuck-web .

# 运行容器
docker run -p 3000:3000 flubiostuck-web
```

## 📦 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (端口 3000) |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |

## 🔧 配置说明

### Next.js 配置 (next.config.js)

- **output**: `standalone` - 独立输出模式，构建产物包含完整的 Node.js 服务器
- **reactStrictMode**: 启用 React 严格模式
- **images**: 配置远程图片域名白名单

### TypeScript 配置 (tsconfig.json)

- 严格模式已启用
- 路径别名: `@/*` 映射到 `src/*`

### Tailwind 配置 (tailwind.config.js)

- 自定义主题颜色
- 支持暗色模式
- 包含自定义动画和效果

## 🌐 主要功能模块

### 1. 数据库查询 (`/database`)
- 流感病毒株信息查询
- 序列数据下载
- 高级筛选功能

### 2. 数据分析 (`/analysis`)
- 基因序列比对
- 进化树可视化
- 统计分析工具

### 3. 社区论坛 (`/forum`)
- 话题讨论
- 用户互动
- 标签分类

### 4. 首页 (`/`)
- 平台介绍
- 快速导航
- 数据可视化展示

## 📄 API 路由

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/components` | GET | 获取组件列表 |
| `/api/analysis` | POST | 序列分析 |
| `/api/benchmark` | GET | 性能基准测试 |
| `/api/download` | GET | 数据下载 |

## 🚧 开发注意事项

1. **代码规范**: 遵循 ESLint 配置
2. **类型安全**: 所有组件和函数使用 TypeScript 类型
3. **样式管理**: 优先使用 Tailwind CSS 工具类
4. **组件复用**: 公共组件放在 `components/ui/`

## 📝 项目交付记录

- **2026-09-19**: 初始版本交付 (详见 DELIVERY_2026-09-19.md)
- **2026-09-20**: 最终版本交付 (详见 DELIVERY_2026-09-20.md)

## 📧 联系方式

如有问题，请联系项目维护团队。

---

**License**: 项目许可证信息
**Version**: 1.0.0
**Last Updated**: 2026-09-30
