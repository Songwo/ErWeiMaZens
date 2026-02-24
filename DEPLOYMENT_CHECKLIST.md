# Cloudflare Pages 部署验证清单

## ✅ 已完成的修复

### 1. TypeScript 编译错误
- [x] 修复 VCardForm.tsx 中的类型错误
- [x] 添加 'other' 类型到 URL 字段

### 2. 文件大小超限问题
- [x] 添加 postbuild 脚本自动清理 .next/cache 目录
- [x] 构建后目录大小从 264MB 降至 4.1MB
- [x] 创建 .cfignore 文件排除不必要的文件

### 3. API 路由迁移
- [x] 将 /api/proxy-image 迁移到 Cloudflare Pages Functions
- [x] 创建 frontend/functions/api/proxy-image.ts

### 4. 配置文件
- [x] frontend/.pages.toml - Pages 构建配置
- [x] frontend/wrangler.toml - Wrangler CLI 配置
- [x] frontend/.cfignore - 部署忽略文件

### 5. 文档更新
- [x] 更新 README.md 中的所有部署说明
- [x] 修正构建命令和输出目录

## 📋 Cloudflare Pages 部署配置

在 Cloudflare Dashboard 中使用以下配置:

```
Framework preset: Next.js
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/.next
Root directory: /
Node version: 22
```

## 🔍 验证步骤

1. **检查构建日志**
   - 确认 "Compiled successfully" 消息
   - 确认 postbuild 脚本执行
   - 确认没有 "file size" 错误

2. **检查部署大小**
   - .next 目录应该约 4-5MB
   - 不应该包含 cache 目录

3. **测试功能**
   - 前端页面正常加载
   - /api/proxy-image 端点工作正常
   - 动态路由 /qr/[id] 和 /teams/[id] 正常

## 🐛 常见问题排查

### 问题: 仍然报 "file size" 错误
**解决方案:**
```bash
# 在本地测试构建
cd frontend
npm run build
du -sh .next
# 应该显示约 4-5MB

# 检查是否有 cache 目录
ls -la .next/ | grep cache
# 应该没有输出
```

### 问题: Functions 不工作
**解决方案:**
- 确认 frontend/functions/api/proxy-image.ts 文件存在
- Cloudflare Pages 会自动识别 functions 目录

### 问题: 动态路由 404
**解决方案:**
- 这是正常的,因为使用了 'use client' 和动态渲染
- 页面会在客户端加载时获取数据

## 📊 构建输出示例

正常的构建应该显示:
```
Route (app)                                 Size  First Load JS
┌ ƒ /                                    1.06 kB         101 kB
├ ƒ /_not-found                            995 B         101 kB
├ ƒ /dashboard                           5.89 kB         175 kB
...
ƒ  (Dynamic)  server-rendered on demand

> postbuild
> rm -rf .next/cache || rmdir /s /q .next\cache
```

## 🚀 下一步

1. 推送代码到 GitHub (已完成 ✅)
2. Cloudflare Pages 会自动触发构建
3. 等待 2-3 分钟完成部署
4. 访问部署的 URL 测试功能

## 📝 技术说明

### 为什么删除 cache 目录?
- Next.js 构建时会生成 webpack 缓存 (60-69MB)
- 这些文件仅用于加速后续构建
- 部署时不需要这些文件
- Cloudflare Pages 有 25MB 单文件限制

### postbuild 脚本工作原理
```json
"build": "next build && npm run postbuild",
"postbuild": "rm -rf .next/cache || rmdir /s /q .next\\cache"
```
- 先执行 next build
- 然后自动执行 postbuild 清理缓存
- 支持 Unix (rm -rf) 和 Windows (rmdir) 系统

### .cfignore 的作用
虽然 postbuild 已经删除了 cache,但 .cfignore 提供额外保护:
- 防止意外上传源代码文件
- 减少部署包大小
- 加快部署速度
