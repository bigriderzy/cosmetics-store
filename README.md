# 尾货化妆品甩卖商城

移动端 H5 商城，微信内打开体验最佳。支持商品浏览、购物车、下单，以及管理后台。

## 快速开始

### 安装依赖

```bash
cd client && npm install
cd ../server && npm install
```

### 启动后端

```bash
cd server
npm run dev
# 运行在 http://localhost:3001
```

### 启动前端

```bash
cd client
npm run dev
# 运行在 http://localhost:5173
```

## 使用说明

### 客户端（客户浏览下单）

- 打开 `http://localhost:5173` 进入商城
- 浏览商品 → 加入购物车 → 结算填信息 → 下单成功 → 扫码付款

### 管理后台（商家管理）

- 打开 `http://localhost:5173/admin/login`
- 默认密码：`admin123`（可通过设置 API 修改）
- 管理商品：新增、编辑、下架、删除
- 管理订单：查看、确认收款、发货、完成

## 部署

### 后端部署到 Railway

1. 在 Railway 创建新项目，指向 `server/` 目录
2. 设置环境变量 `PORT=3001`

### 前端部署到 Vercel

1. 在 Vercel 导入项目，设置 root directory 为 `client/`
2. 设置环境变量 `VITE_API_URL` 指向 Railway 后端地址
3. 部署

## 技术栈

- React 18 + Vite + Tailwind CSS
- Express + better-sqlite3
