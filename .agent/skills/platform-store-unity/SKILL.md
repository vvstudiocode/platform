---
description: 總部與子網站架構統一原則 - 確保樣式、功能、元件保持一致
---

# 總部與子網站統一架構原則

## 核心原則

**總部 (Platform) 和子網站 (Store) 在功能、樣式、元件上必須保持一致。**

- 總部只是多了「管理其他子網站」的功能
- 其他所有功能（商品管理、訂單處理、頁面編輯等）應完全相同

## 共用資源

### 1. 樣式系統
- 所有 CSS 變數、主題色彩應統一
- 預覽區域使用與子網站相同的樣式
- 避免為總部創建獨立的樣式系統

### 2. Dashboard 元件
總部和子網站共用以下 Dashboard 元件：

| 元件 | 路徑 | 說明 |
|-----|------|------|
| `DashboardLayout` | `/components/dashboard/dashboard-layout.tsx` | 主要佈局，包含側邊欄和手機版底部導覽 |
| `CollapsibleSidebar` | `/components/dashboard/collapsible-sidebar.tsx` | 可收合側邊欄，支援分區標題 |

**重要實現細節**：
- 側邊欄使用 `sticky top-0 h-screen` 確保延伸到底部
- 支援 `navItems` (單一列表) 或 `navSections` (分區列表) 兩種模式
- 手機版底部導覽取前 5 個項目顯示

### 3. 頁面編輯器元件
頁面編輯器的元件共用：
- `ComponentPreview` - 預覽渲染
- `ComponentEditor` - 編輯器表單  
- 位於 `/components/page-editor/`

### 4. 資料結構
- 商品、訂單、頁面的資料結構完全一致
- API 端點盡可能共用

## 開發規範

### 新增功能時
1. **先在 store 實現** - 作為基礎版本
2. **同步到 platform** - 確保總部也有相同功能
3. **只在 platform 額外添加** - 跨商店管理功能

### 修改現有功能時
1. **兩邊同時修改** - 避免功能分歧
2. **檢查共用元件** - 確保不會破壞另一端

## 目錄對應

| 功能 | 總部路徑 | 子網站路徑 | 共用元件 |
|------|---------|-----------|---------|
| Layout | `/admin/(dashboard)/layout.tsx` | `/app/(dashboard)/layout.tsx` | `/components/dashboard/` |
| 頁面編輯 | `/admin/(dashboard)/pages/` | `/app/(dashboard)/pages/` | `/components/page-editor/` |
| 商品管理 | `/admin/(dashboard)/products/` | `/app/(dashboard)/products/` | - |
| 訂單管理 | `/admin/(dashboard)/orders/` | `/app/(dashboard)/orders/` | - |
| 樣式 | `/app/globals.css` | 共用 | - |

## 商品元件

商品選擇器應能：
1. 載入當前商店的所有商品
2. 按分類 (`category` 欄位) 篩選
3. 支援搜尋商品名稱

## 檢查清單

修改任何功能前，請確認：
- [ ] 是否影響 Platform 端？
- [ ] 是否影響 Store 端？
- [ ] 共用元件是否需要更新？
- [ ] 樣式是否保持一致？
