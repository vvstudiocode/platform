# Platform

電商平台系統

## 部署指南

### 環境要求
- Node.js 22+
- npm 10+

### 本地開發

```bash
npm install
npm run dev
```

### 本地構建測試

```bash
npm run build
npm start
```

### Docker 優化規則

本項目已針對 Zeabur 部署進行優化，以減少鏡像大小和加快部署速度。

**關鍵優化：**

- 使用 node:22-slim 基礎鏡像（而不是完整版本）
- 只安裝生產依賴（npm ci --only=production）
- 排除不必要的文件（.dockerignore）
- 構建後清理緩存文件

**鏡像大小目標：** < 400MB

### 部署到 Zeabur

1. 確保本地 `npm run build` 成功
2. 提交所有更改到 Git
3. Push 到主分支
4. Zeabur 會自動檢測並部署

### 常見問題

**Q: 部署失敗，顯示 "no space left on device"**

A: 這通常是因為鏡像過大。檢查：
- .dockerignore 是否完整
- package.json 中是否有不必要的生產依賴
- 運行 `npm ls` 檢查依賴樹

**Q: 應用啟動後返回 502 Bad Gateway**

A: 檢查：
- 應用是否在監聽 8080 端口
- npm run build 是否成功
- 環境變量是否正確設置

**Q: 如何減少鏡像大小？**

A:
- 移除不必要的依賴到 devDependencies
- 更新 .dockerignore 排除更多文件
- 使用多階段構建（如果需要）

### 依賴管理

**生產依賴（dependencies）：**
- 只包含應用運行時需要的包
- 例如：react, next, axios 等

**開發依賴（devDependencies）：**
- TypeScript 相關：typescript, @types/node, @types/react
- 測試框架：jest, @testing-library/react
- Linting：eslint, prettier
- 構建工具：webpack, babel（如果需要）

### 環境變量

在 Zeabur 控制台設置環境變量，不要提交 .env 文件到 Git。

### 監控和日誌

在 Zeabur 控制台查看：
- 構建日誌：檢查構建過程
- 運行時日誌：檢查應用運行狀態
