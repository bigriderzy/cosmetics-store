# 甩卖尾货化妆品商城 - 设计文档

## 概述

一个面向微信生态的 H5 移动商城，用于甩卖尾货化妆品。客户在微信中浏览商品并下单，商家通过管理后台管理商品和订单。无需营业执照、无需在线支付集成，通过展示收款码完成交易。

## 技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 前端 | React 18 + Vite + Tailwind CSS | 移动端 H5，微信浏览器兼容 |
| 后端 | Node.js + Express | REST API |
| 数据库 | SQLite (better-sqlite3) | 单文件，零配置，备份简单 |
| 前端部署 | Vercel / Cloudflare Pages | 免费托管 |
| 后端部署 | Railway / Render | 免费额度 |

## 项目结构

```
cosmetics-store/
├── client/                  # React 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProductList.tsx      # 商品列表（首页）
│   │   │   ├── ProductDetail.tsx    # 商品详情
│   │   │   ├── Cart.tsx             # 购物车
│   │   │   ├── Checkout.tsx         # 提交订单
│   │   │   └── OrderConfirm.tsx     # 订单确认页
│   │   ├── admin/
│   │   │   ├── AdminLogin.tsx       # 管理后台登录
│   │   │   ├── AdminDashboard.tsx   # 概览统计
│   │   │   ├── AdminOrders.tsx      # 订单管理
│   │   │   ├── AdminProducts.tsx    # 商品列表管理
│   │   │   └── AdminProductEdit.tsx # 新增/编辑商品
│   │   ├── components/              # 共用组件
│   │   ├── hooks/                   # 自定义 hooks
│   │   └── utils/                   # API 请求工具
│   └── package.json
├── server/                  # Express 后端
│   ├── src/
│   │   ├── index.js         # 入口
│   │   ├── routes/
│   │   │   ├── products.js  # 商品 API
│   │   │   ├── orders.js    # 订单 API
│   │   │   └── admin.js     # 管理后台 API（含登录）
│   │   ├── db.js            # 数据库初始化
│   │   └── middleware.js    # 认证中间件
│   └── package.json
└── README.md
```

## 数据模型

### products 商品表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| name | TEXT | 商品名称 |
| description | TEXT | 商品描述 |
| price | REAL | 售价 |
| original_price | REAL | 原价（可空） |
| images | TEXT | JSON 数组，图片 URL 列表 |
| stock | INTEGER | 库存数量 |
| category | TEXT | 分类标签 |
| status | TEXT | active / sold_out / hidden |
| created_at | TEXT | 创建时间 ISO 字符串 |
| updated_at | TEXT | 更新时间 ISO 字符串 |

### orders 订单表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| customer_name | TEXT | 客户姓名 |
| customer_phone | TEXT | 手机号 |
| items | TEXT | JSON，[{product_id, name, price, qty}] |
| total_amount | REAL | 总金额 |
| status | TEXT | pending / paid / shipped / completed / cancelled |
| note | TEXT | 客户备注 |
| created_at | TEXT | 下单时间 ISO 字符串 |
| updated_at | TEXT | 状态更新时间 ISO 字符串 |

## 功能清单

### 客户端（客户）

- 商品列表页：按分类筛选，展示商品卡片（图片、名称、售价、原价划线）
- 商品详情页：多图轮播、描述、库存显示、数量选择、加入购物车
- 购物车：修改数量、删除商品、合计金额
- 提交订单：填写姓名+手机号+备注，确认订单内容
- 订单确认页：展示订单详情、收款码/转账信息、订单编号

### 管理后台（商家）

- 密码登录认证
- 首页概览：今日订单数、待处理数、总收入
- 订单管理：列表、按状态筛选、修改订单状态
- 商品管理：列表、新增、编辑、删除、上下架
- 商品编辑时可直接修改库存数量

## 业务逻辑

### 库存同步

- 客户提交订单 → 扣减对应商品库存
- 订单取消 → 恢复对应商品库存
- 库存为 0 → 商品标记售罄，不可加购
- 加购时数量不能超过当前库存

### 订单状态流转

```
pending（待确认） → paid（已付款） → shipped（已发货） → completed（已完成）
                                                         
                   → cancelled（已取消）
```

### 下单后流程

1. 客户提交订单，订单状态为 pending
2. 客户看到收款码/转账信息，自行转账
3. 商家在管理后台确认收款后，将状态改为 paid → shipped → completed

## API 设计

### 商品 API（公开）
- `GET /api/products` — 商品列表（支持 ?category=&status=active）
- `GET /api/products/:id` — 商品详情

### 订单 API（公开）
- `POST /api/orders` — 提交订单

### 管理 API（需登录）
- `POST /api/admin/login` — 管理后台登录
- `GET /api/admin/orders` — 订单列表（支持 ?status=）
- `PATCH /api/admin/orders/:id/status` — 更新订单状态
- `GET /api/admin/products` — 商品列表（含下架）
- `POST /api/admin/products` — 新增商品
- `PUT /api/admin/products/:id` — 编辑商品
- `DELETE /api/admin/products/:id` — 删除商品
- `PATCH /api/admin/products/:id/status` — 上下架
- `GET /api/admin/dashboard` — 概览统计

## 认证方案

- 管理后台使用简单的 Session Token 认证
- 商家在 `/admin/login` 输入密码，后端验证后返回 token
- Token 存储在 localStorage，后续请求携带 token
- 密码通过环境变量配置

## 收款方案

- 下单成功后展示预设的微信/支付宝收款码图片
- 同时展示收款金额文字提示
- 收款码图片通过管理后台可更换
