# LynxiGlam

一个全栈电商站点技术练习项目：**Next.js 16** 店铺前台 + 后台管理，背后是 **Spring Boot 4 / Java 21** 电商 API，两端通过同一份带类型的数据契约打通。

> **当前状态：本地开发。** 尚未部署，且**以现状不可公开上线**——原因见[素材与署名](#素材与署名)和[公开上线前的阻断项](#公开上线前的阻断项)。

## 包含什么

- **店铺前台** —— 首页、集合页（按甲型/类型/价格/库存分面筛选 + 排序）、商品详情（图集与悬停视频）、搜索、购物车、心愿单、结算与订单确认、博客、信息页。
- **后台管理** —— 仪表盘、商品、集合、订单、客户，以及按商品维度的分析（浏览 / 点击 / 加购）。
- **双语** —— 店铺与后台均支持 English / 简体中文。
- **电商 API** —— 目录、集合、内容、评价、结算（运费、优惠码、下单）、账户（注册/登录/心愿单/邮件订阅）、埋点上报与分析查询。

## 技术栈

| | |
|---|---|
| 前端 | Next.js 16（App Router）、React 19、TypeScript strict、Tailwind CSS v4 |
| 后端 | Java 21、Spring Boot 4、Spring MVC、JDBC、Spring Security、Flyway |
| 数据库 | MySQL 8（生产） · 内存 H2 的 MySQL 兼容模式（本地开发与测试） |

## 目录结构

```
.                    # Next.js 应用（前端）
├─ src/app/          # 路由（店铺 + /admin 后台）
├─ src/components/   # UI 组件
├─ src/lib/api/      # 数据层 —— 所有组件只从这里取数
├─ src/lib/data/     # 本地 mock 数据源
└─ backend/          # Spring Boot 电商 API（com.lynxiglam.store）
   └─ src/main/resources/db/migration/   # Flyway 表结构与种子数据
docs/API_CONTRACT.md # 后端需实现的 REST 契约
```

## 快速开始

### 前端（可独立运行，无需后端）

```bash
npm install
npm run dev          # http://localhost:3000
```

默认使用本地 mock 数据源，零配置即可浏览整站。

### 后端

需要 **JDK 21**（例如 [Temurin](https://adoptium.net/)）。设置好 `JAVA_HOME` 后：

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev     # http://localhost:8090/api
```

`dev` profile 使用内存 H2 数据库并自动导入种子数据，**不需要 MySQL**。

### 让前端连到后端

```bash
cp .env.example .env.local           # 然后设 NEXT_PUBLIC_DATA_SOURCE=api
npm run dev
```

注意：`NEXT_PUBLIC_*` 在**构建期被内联**——数据源在构建时就固定了，不是运行时读取。

**开发环境管理员账号**（仅 dev/local profile，由 `AdminBootstrap` 播种）：`admin@lynxiglam.local` / `lynxiglam-admin`。

## 测试

```bash
npm run check                  # lint + 类型检查 + 生产构建
cd backend && ./mvnw test      # 45 个白盒测试
```

后端测试通过 MockMvc 驱动（进程内，不监听端口），覆盖：金额精度、目录与 facets、优惠码/运费/税费、订单金额与幂等、并发重复下单、埋点并发原子累加、鉴权与会话、CORS、错误契约，以及 JSON 字段与 TypeScript 类型的契约一致性。

## 架构要点

- **单一数据契约。** 组件只从 `src/lib/api` 取数，该模块满足 `StoreApi` 接口（`src/lib/api/contract.ts`）。mock 与真实 API 的切换只是一个环境变量，组件零改动。mock 实现通过 `satisfies StoreApi` 在编译期与契约对齐。
- **金额用整数分**存储于数据库，出参为 `BigDecimal` 主单位。服务端不对金额做浮点运算。
- **下单幂等** —— 客户端每次提交生成一个 UUID，数据库唯一约束保证重试（含并发重试）返回既有订单而不会重复建单。
- **统一错误信封**（`{code, message, fields, timestamp}`）。前端抛出带类型的 `ApiError`；404 转为 `null`，401 表示未登录，5xx 与网络错误绝不被掩盖。
- **刻意不接支付。** `orders.payment_intent_id` 字段为后续支付方预留。

完整端点清单见 [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)。

## 素材与署名

**本仓库中的图片、视频、商品文案、评价与页面内容并非原创。** 它们是在用本项目练习"逆向复刻一个电商站"时，从 [glamnetic.com](https://www.glamnetic.com/) 提取的，版权归各自权利人所有，**不在本仓库 MIT 授权范围内**——详见 [`NOTICE`](NOTICE)。

应用中渲染的评价、评分、零售/媒体标识、奖项徽章与认证声明**均为占位示例数据，并非真实**。

本项目基于 [ai-website-clone-template](https://github.com/JCodesMore/ai-website-cloner-template)（作者 JCodesMore，MIT）搭建。

## 公开上线前的阻断项

代码与本地联调已就绪，但**尚未部署**。仍需处理：

- **必须处理**：第三方素材与品牌/商标引用需替换为自有或已授权内容；伪造的评价、未经授权的认证/奖项/零售商/媒体声明需移除；结算页无后端对接的银行卡号输入框需移除。
- **必须处理**：`/admin` 没有服务端鉴权（客户端 `AdminGate` 仅是交互层面），需补 `src/middleware.ts` 守卫。后端 `/analytics` 已有会话鉴权。
- **部署本身**：见 [`deploy/RUNBOOK.md`](deploy/RUNBOOK.md)。目标是共享生产机，每个改动共享机的步骤都需明确授权。

已解决（早期版本的阻断项，现已处理，此处备忘）：

- Spring 默认 profile 已改为 `prod`（fail-safe，缺 DB 变量即启动报错）；prod 首个管理员由 `AdminProvisionRunner` 开通（见 RUNBOOK）。
- 限流与部署自动化已设计（`deploy/` 下的 nginx 限流区 + systemd + CI）——尚待在服务器上执行。
- 店铺路由的静态预渲染陈旧问题已修（首页与 PDP 加 `revalidate = 0`）。
- 显示价与实收价的浮点差异已修（结算端改整数分，与后端一致）。
