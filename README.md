# ErWeiMaZens — 二维码管理平台

一个基于 **Next.js 15 + Cloudflare Workers** 的全功能二维码生成与管理系统，支持动态二维码、自定义落地页、密码保护、地理围栏等高级功能，完全免费部署在 Cloudflare 边缘网络。

---

## 功能列表

| 功能 | 说明 |
|------|------|
| 多类型二维码 | URL、纯文本、WiFi、vCard 名片（含多语言备用姓名） |
| 样式自定义 | 点样式、角落样式、颜色、渐变、Logo |
| 动态二维码 | 扫码跳短链，后台可随时修改目标 |
| 过期时间 | 为每个二维码设置独立过期时间 |
| 密码保护 | 扫码需输入密码才能访问 |
| 自定义落地页 | 扫码跳 H5 页面（标题/简介/按钮/主题） |
| 地理围栏 | 按国家/地区跳转不同链接 |
| 扫描统计 | 记录扫描次数、时间、匿名 IP |
| 批量生成 | 一次输入多条 URL，批量出码 |
| ZIP 下载 | 批量生成后一键打包下载 PNG |
| 动画 GIF | 生成彩色循环动画二维码 GIF |
| 文件夹分类 | 给二维码打文件夹标签，仪表盘一键过滤 |
| 自定义短链域名 | 设置页面配置自己的域名作为短链前缀 |
| Open API | 生成 API Key，通过 REST API 程序化管理二维码 |
| 多语言 | 中文 / English |
| 深色模式 | 自动跟随系统 |

---

## 技术栈

```
前端：Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
后端：Cloudflare Workers (Hono.js)
存储：Cloudflare KV（无数据库，零成本）
认证：Session Token（存 KV，7 天有效）
```

---

## 本地开发

### 前置要求

- Node.js 18+（推荐 20）
- pnpm（`npm i -g pnpm`）或 npm
- Cloudflare 账号（免费即可）
- Wrangler CLI（`npm i -g wrangler`）

### 第一步：克隆项目

```bash
git clone https://github.com/your-username/ErWeiMaZens.git
cd ErWeiMaZens
```

### 第二步：安装依赖

```bash
# 根目录
npm install

# 前端
cd frontend && npm install && cd ..

# 后端
cd workers && npm install && cd ..
```

### 第三步：创建 Cloudflare KV 命名空间

```bash
# 登录 Cloudflare
wrangler login

# 创建两个 KV 命名空间
wrangler kv:namespace create QR_KV
wrangler kv:namespace create AUTH_KV
```

命令执行后会输出类似：
```
{ binding = "QR_KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

把两个 id 填入 `workers/wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "QR_KV"
id = "你的QR_KV_ID"
preview_id = "你的QR_KV_ID"

[[kv_namespaces]]
binding = "AUTH_KV"
id = "你的AUTH_KV_ID"
preview_id = "你的AUTH_KV_ID"
```

### 第四步：启动本地开发服务器

**终端 1 — 启动 Workers 后端（端口 8787）：**
```bash
cd workers
npx wrangler dev
```

**终端 2 — 启动 Next.js 前端（端口 3000）：**
```bash
cd frontend
npm run dev
```

打开浏览器访问 `http://localhost:3000`，注册账号即可使用。

---

## Cloudflare 生产部署

### 部署后端（Workers）

```bash
cd workers
npx wrangler deploy
```

部署成功后会输出 Workers 地址，例如：
```
https://erweimazens.your-subdomain.workers.dev
```

### 部署前端（Cloudflare Pages）

**方式一：通过 GitHub 自动部署（推荐）**

1. 把代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. 选择你的仓库，配置如下：

| 配置项 | 值 |
|--------|-----|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `cd frontend && npm install && npm run build` |
| Build output directory | `frontend/out` |
| Root directory | `/` |
| Node version | 22 |

5. 点击 **Save and Deploy**

**方式二：手动部署**

```bash
cd frontend
npm run build
npx wrangler pages deploy .next --project-name erweimazens
```

### 配置前端指向生产 Workers

编辑 `frontend/next.config.ts`，把 `localhost:8787` 改为你的 Workers 地址：

```typescript
async rewrites() {
  return [
    { source: '/api/:path*', destination: 'https://erweimazens.your-subdomain.workers.dev/api/:path*' },
    { source: '/q/:path*',   destination: 'https://erweimazens.your-subdomain.workers.dev/q/:path*' },
  ]
}
```

### 配置 Workers CORS 允许生产域名

编辑 `workers/src/index.ts`：

```typescript
app.use('*', cors({
  origin: ['https://your-pages-domain.pages.dev', 'https://yourdomain.com'],
  credentials: true,
}))
```

然后重新部署：
```bash
cd workers && npx wrangler deploy
```

### 绑定自定义域名（可选）

1. Cloudflare Dashboard → **Workers & Pages** → 选择你的 Pages 项目
2. **Custom domains** → **Set up a custom domain**
3. 输入你的域名（需要域名已托管在 Cloudflare）

---

## 使用指南

### 注册 / 登录

访问首页，点击「注册账号」，输入邮箱和密码（至少 8 位）完成注册。

### 创建二维码

1. 点击右上角「新建二维码」
2. 填写标题
3. 选择类型：
   - **URL**：输入网址，扫码直接跳转
   - **文本**：输入任意文字
   - **WiFi**：输入 SSID、密码、加密方式，扫码自动连接
   - **名片**：填写姓名、电话、邮箱等，扫码保存联系人
4. 自定义样式（点样式、颜色、渐变、Logo）
5. 高级选项：
   - **过期时间**：设置后二维码到期自动失效
   - **访问密码**：扫码需输入密码
   - **落地页**：扫码跳自定义 H5 页面
   - **地理围栏**：按国家跳转不同链接
6. 点击「创建二维码」

### 管理二维码

- **仪表盘**：查看所有二维码，每张卡片显示预览图
- **复制**：URL 类型复制短链，其他类型复制原始内容
- **编辑**：修改内容、样式、高级设置
- **删除**：删除二维码（不可恢复）
- **统计**：编辑页面底部查看扫描次数和来源 IP

### 批量生成

1. 点击导航栏「批量生成」
2. 每行输入一个 URL（最多 50 条）
3. 点击「批量生成」
4. 生成完成后点击「下载 ZIP」获取所有 PNG 文件

---

## 项目结构

```
ErWeiMaZens/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/             # 页面路由
│   │   │   ├── (auth)/login/        # 登录页
│   │   │   └── (dashboard)/         # 仪表盘、创建、编辑
│   │   ├── components/
│   │   │   ├── qr/          # 二维码相关组件
│   │   │   └── ui/          # 基础 UI 组件
│   │   └── lib/
│   │       ├── api.ts       # API 客户端
│   │       └── types.ts     # 类型定义
│   ├── messages/            # 国际化文案
│   │   ├── zh.json
│   │   └── en.json
│   └── next.config.ts       # 代理配置（指向 Workers）
│
└── workers/                  # Cloudflare Workers 后端
    ├── src/
    │   ├── index.ts         # 入口 + CORS
    │   ├── middleware/auth.ts
    │   ├── lib/
    │   │   ├── auth.ts      # 密码加密、Token 工具
    │   │   └── types.ts     # 数据类型
    │   └── routes/
    │       ├── auth.ts      # 注册/登录/登出
    │       ├── qr.ts        # 二维码 CRUD
    │       └── shortlink.ts # 扫码跳转（密码/落地页/围栏）
    └── wrangler.toml        # Workers 配置
```

---

## Open API 使用

### 获取 API Key

登录后进入侧边栏 **API 密钥** 页面，创建一个密钥（只显示一次，请立即保存）。

### 认证方式

所有 API 请求在 Header 中携带：

```
Authorization: Bearer ak_YOUR_KEY
```

### 创建二维码

```bash
curl https://erweimazens.your-subdomain.workers.dev/api/qr \
  -H "Authorization: Bearer ak_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My QR",
    "content": "https://example.com",
    "qrType": "url"
  }'
```

### 获取二维码列表

```bash
curl https://erweimazens.your-subdomain.workers.dev/api/qr \
  -H "Authorization: Bearer ak_YOUR_KEY"
```

### 删除二维码

```bash
curl -X DELETE https://erweimazens.your-subdomain.workers.dev/api/qr/{id} \
  -H "Authorization: Bearer ak_YOUR_KEY"
```

---

## 常见问题

**Q: 扫码后提示 "QR code not found"？**
A: 确认 Workers 已部署，且 `next.config.ts` 中的代理地址正确。

**Q: 登录后访问 API 返回 401？**
A: 清除浏览器 localStorage（`localStorage.removeItem('session_token')`），重新登录。

**Q: 本地开发时 KV 数据不持久？**
A: 本地 `wrangler dev` 使用内存 KV，重启后数据清空。生产部署后数据持久化。

**Q: 名片二维码扫码后手机无法识别？**
A: 确认手机系统支持 vCard 3.0。iOS 和 Android 均支持，部分第三方扫码 App 可能不支持。

**Q: 如何修改 CORS 允许的域名？**
A: 编辑 `workers/src/index.ts` 中的 `origin` 数组，重新 `wrangler deploy`。

---

## 免费额度说明

Cloudflare 免费计划包含：
- Workers：每天 10 万次请求
- KV：每天 10 万次读取，1000 次写入，1 GB 存储
- Pages：无限静态请求

对于个人或小团队使用完全够用。

---

## 🚀 Cloudflare 完整小白部署教程

> 全程免费，不需要服务器，不需要信用卡（免费计划即可）。

### 准备工作

1. 注册 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费）
2. 安装 Node.js 20：[nodejs.org](https://nodejs.org)
3. 打开终端（Windows 用 PowerShell 或 CMD）

### 第一步：安装工具

```bash
npm install -g wrangler
```

验证安装：
```bash
wrangler --version
```

### 第二步：登录 Cloudflare

```bash
wrangler login
```

浏览器会自动打开，点击「Allow」授权即可。

### 第三步：克隆代码

```bash
git clone https://github.com/your-username/ErWeiMaZens.git
cd ErWeiMaZens
```

### 第四步：安装依赖

```bash
# 安装后端依赖
cd workers
npm install
cd ..

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 第五步：创建 KV 存储

KV 是 Cloudflare 的键值数据库，用来存储二维码数据和用户信息。

```bash
cd workers

# 创建二维码存储
wrangler kv:namespace create QR_KV

# 创建认证存储
wrangler kv:namespace create AUTH_KV
```

每条命令执行后会输出类似：
```
{ binding = "QR_KV", id = "abc123def456..." }
```

**把两个 id 填入 `workers/wrangler.toml`：**

```toml
[[kv_namespaces]]
binding = "QR_KV"
id = "你的QR_KV_ID"
preview_id = "你的QR_KV_ID"

[[kv_namespaces]]
binding = "AUTH_KV"
id = "你的AUTH_KV_ID"
preview_id = "你的AUTH_KV_ID"
```

### 第六步：部署后端（Workers）

```bash
cd workers
npx wrangler deploy
```

部署成功后输出：
```
✅ Deployed to: https://erweimazens.你的子域名.workers.dev
```

**记下这个地址，下一步要用。**

### 第七步：配置前端指向后端

编辑 `frontend/next.config.ts`，把 `localhost:8787` 替换为上一步的 Workers 地址：

```typescript
async rewrites() {
  return [
    { source: '/api/:path*', destination: 'https://erweimazens.你的子域名.workers.dev/api/:path*' },
    { source: '/q/:path*',   destination: 'https://erweimazens.你的子域名.workers.dev/q/:path*' },
  ]
}
```

### 第八步：构建前端

```bash
cd frontend
npm run build
```

### 第九步：部署前端（Cloudflare Pages）

**方式一：命令行部署（最简单）**

```bash
cd frontend
npm run build
npx wrangler pages deploy .next --project-name erweimazens
```

首次运行会提示创建项目，按回车确认即可。

部署成功后输出：
```
✅ Deployment complete! URL: https://erweimazens.pages.dev
```

**方式二：GitHub 自动部署（推荐，以后每次 push 自动更新）**

1. 把代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 左侧菜单 → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. 选择你的 GitHub 仓库
5. 填写构建配置：

| 配置项 | 值 |
|--------|-----|
| Framework preset | Next.js |
| Build command | `cd frontend && npm install && npm run build` |
| Build output directory | `frontend/.next` |
| Root directory | `/` |

6. 点击 **Save and Deploy**，等待2-3分钟

### 第十步：配置 CORS（允许前端访问后端）

编辑 `workers/src/index.ts`，把 Pages 域名加入允许列表：

```typescript
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://erweimazens.pages.dev',      // 你的 Pages 域名
    'https://yourdomain.com',              // 自定义域名（可选）
  ],
  credentials: true,
}))
```

然后重新部署后端：
```bash
cd workers && npx wrangler deploy
```

### 第十一步：绑定自定义域名（可选）

**给前端绑定域名：**
1. Cloudflare Dashboard → Workers & Pages → 选择你的 Pages 项目
2. **Custom domains** → **Set up a custom domain**
3. 输入你的域名（域名需要托管在 Cloudflare DNS）

**给后端绑定域名：**
1. Cloudflare Dashboard → Workers & Pages → 选择你的 Worker
2. **Settings** → **Triggers** → **Add Custom Domain**
3. 输入子域名，如 `api.yourdomain.com`

### 验证部署

打开浏览器访问你的 Pages 地址，点击「注册账号」，注册成功即部署完成！

### 常见部署问题

**Q: `wrangler deploy` 报错 "Missing KV namespace binding"？**
A: 检查 `workers/wrangler.toml` 中的 KV id 是否正确填写。

**Q: 前端部署后访问 API 返回 404？**
A: 检查 `frontend/next.config.ts` 中的 Workers 地址是否正确，重新构建部署。

**Q: 登录后跳转到 /login 循环？**
A: 检查 Workers CORS 配置是否包含了你的 Pages 域名，重新部署 Workers。

**Q: Pages 构建失败？**
A: 确认 Build command 为 `cd frontend && npm install && npm run build`，Build output 为 `frontend/.next`。如果遇到文件大小超限错误，确保 `frontend/.cfignore` 文件存在并包含了 `.next/cache/` 目录。

**Q: 如何查看 Workers 日志？**
A: `cd workers && npx wrangler tail`，实时查看请求日志。
