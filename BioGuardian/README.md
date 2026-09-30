# BioGuardian (桌面版)

BioGuardian 是一款基于合成生物学知识产权保护与法律服务的桌面应用平台。

# 注意:上传的代码没有包含supabase密钥，如无法注册及登录，请使用自己的supabase创建表格并连接平台或者下载release中发布的压缩包完整版本

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 7
- **UI 框架**: Tailwind CSS
- **3D 渲染**: Three.js
- **动画**: Framer Motion
- **数据库**: Supabase + PGLite
- **ORM**: Prisma

## 功能特性

- 用户认证与授权系统
- 生物安全知识可视化
- 3D 交互场景展示
- 数据库本地/云端同步
- 响应式设计

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/ofebesuri/ibec-.git
cd ibec-/BioGuardian
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

首先注册并登录supabase并按照supabase文件夹创建对应表单，再创建 `.env.local` 文件，参考 `.env.development` 配置以下变量：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

## 项目结构

```
BioGuardian/
├── src/
│   ├── components/     # React 组件
│   ├── db/            # 数据库配置
│   ├── lib/           # 工具库
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   ├── App.tsx        # 主应用组件
│   ├── Login.tsx      # 登录组件
│   └── main.tsx       # 应用入口
├── prisma/            # Prisma 数据库架构
├── supabase/          # Supabase 配置
├── public/            # 静态资源（如果有）
└── package.json       # 依赖配置
```

## 开发说明

- 使用 ESLint 进行代码检查：`npm run lint`
- 使用 TypeScript 进行类型检查：`npm run build`

## 许可证

本项目用于 iBEC 竞赛参赛作品

## 联系方式

邮箱: ofebesuri09@gmail.com
