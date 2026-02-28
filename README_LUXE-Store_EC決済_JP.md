# LUXE — ラグジュアリーファッションECプラットフォーム

> **何を:** Stripe決済・Webhook連携・管理画面・多言語対応を備えた本格フルスタックECアプリケーション
> **誰に:** 実務レベルのWeb開発スキルを証明したいエンジニア向けポートフォリオ
> **技術:** Next.js 15 / React 19 / TypeScript 5.7 / Stripe / PostgreSQL / Prisma / next-intl

**ライブデモ:** [https://luxe-store-ruby.vercel.app](https://luxe-store-ruby.vercel.app)
**ソースコード:** [https://github.com/mer-prog/luxe-store](https://github.com/mer-prog/luxe-store)

---

## このプロジェクトで証明できるスキル

| スキル | 実装内容 |
|:-------|:---------|
| **フルスタックEC構築** | 商品一覧・カート・決済・注文管理・管理画面までエンドツーエンドで実装 |
| **外部決済サービス連携** | Stripe Checkout Session 作成、Webhook署名検証、セッション期限切れ・決済失敗のハンドリング |
| **認証・認可設計** | NextAuth.js v5 による JWT セッション、Middleware でのルート保護、RBAC（ADMIN / CUSTOMER） |
| **データベース設計** | Prisma による9モデル・3enum のスキーマ設計、楽観的在庫ロック、トランザクション処理 |
| **国際化（i18n）** | next-intl による日英切替、Cookie ベースロケール、ロケール連動通貨フォーマット（¥ ↔ $） |
| **セキュリティ対策** | bcrypt パスワードハッシュ、HSTS / X-Frame-Options / CSP ヘッダー、Zod バリデーション |
| **モダンフロントエンド** | React 19 Server Components / Server Actions、shadcn/ui コンポーネント、Recharts ダッシュボード |

---

## 技術スタック

| カテゴリ | 技術 | 用途 |
|:---------|:-----|:-----|
| フレームワーク | Next.js 15（App Router） | Server Components、Server Actions、Middleware |
| UI | React 19、Tailwind CSS 3.4、shadcn/ui | Radix Primitives ベースのコンポーネントシステム |
| 言語 | TypeScript 5.7（strict） | エンドツーエンドの型安全性 |
| データベース | PostgreSQL（Neon サーバーレス） | `@neondatabase/serverless` によるプール接続 |
| ORM | Prisma 6.2 | スキーマファースト・型安全なDB操作 |
| 認証 | NextAuth.js v5（beta） | JWT セッション、Credentials プロバイダー、RBAC |
| 決済 | Stripe Checkout + Webhooks | PCI準拠の決済処理 |
| メール | Resend | 注文確認トランザクションメール |
| バリデーション | Zod | フォーム・API入力のランタイムスキーマ検証 |
| チャート | Recharts | 管理画面の月次売上グラフ |
| 国際化 | next-intl 4.8 | 日英切替、Cookie ベースロケール、通貨フォーマット連動 |
| アイコン | Lucide React | 統一されたアイコンシステム |

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                     ブラウザ（クライアント）                      │
│  React 19 UI ── Server Components + Client Components       │
│  LanguageToggle (JP|EN) ── Cookie (NEXT_LOCALE) 永続化       │
└──────────────┬──────────────────────────────────────────────┘
               │ リクエスト
┌──────────────▼──────────────────────────────────────────────┐
│                  Next.js 15 ── App Router                    │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  Middleware   │  │ Server        │  │ API Routes       │  │
│  │  Auth + RBAC  │  │ Components    │  │ /api/checkout    │  │
│  │  ルート保護    │  │ + Server      │  │ /api/webhooks/   │  │
│  │              │  │   Actions     │  │   stripe         │  │
│  └──────────────┘  └───────┬───────┘  └────────┬─────────┘  │
│                            │                    │            │
│  ┌─────────────────────────▼────────────────────▼─────────┐  │
│  │              Prisma ORM（型安全クエリ）                   │  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────┘
                             │ SQL
┌────────────────────────────▼─────────────────────────────────┐
│              PostgreSQL（Neon サーバーレス）                    │
│   9モデル・3 enum ── User, Product, Cart, Order, Review 他    │
└──────────────────────────────────────────────────────────────┘

               外部サービス連携
┌──────────────────────┐  ┌──────────────────────┐
│  Stripe              │  │  Resend              │
│  Checkout Session    │  │  注文確認メール        │
│  Webhook イベント     │  │  ベストエフォート送信   │
└──────────────────────┘  └──────────────────────┘
```

---

## 決済フローアーキテクチャ

```
カート ──▶ POST /api/checkout ──▶ Stripe Checkout Session 作成
                │
                ├── 在庫バリデーション
                ├── 楽観的在庫ロック（トランザクション内で stock を decrement）
                ├── Order レコード作成（status: PENDING）
                ├── Stripe line_items 構築（税金10%を別行表示）
                └── セッション有効期限: 30分
                                    │
                                    ▼
                        顧客が Stripe 上で決済
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        決済成功                              セッション期限切れ
checkout.session.completed              checkout.session.expired
                │                                       │
                ▼                                       ▼
┌───────────────────────────┐     ┌──────────────────────────┐
│ • Stripe 署名検証           │     │ • 在庫を復元（increment）  │
│ • 冪等性チェック             │     │ • 注文ステータス:          │
│ • Order → CONFIRMED        │     │   CANCELLED / EXPIRED    │
│ • Payment → PAID           │     └──────────────────────────┘
│ • 配送先住所を保存           │
│ • カートをクリア             │              決済失敗
│ • 確認メール送信（Resend）   │     payment_intent.payment_failed
└───────────────────────────┘                   │
                │                               ▼
                ▼                    ┌───────────────────────┐
     /checkout/success へ           │ Payment → FAILED       │
     リダイレクト                     └───────────────────────┘

エッジケース:
  • メール送信失敗 → ログ出力のみ、注文処理はブロックしない
  • 同時チェックアウト → 楽観的在庫ロックで過剰販売を防止
  • 二重Webhook → 冪等性チェック（paymentStatus === "PAID" なら処理スキップ）
```

**通貨表示について:** 言語トグル（JP / EN）により価格表示が切り替わります（JP: ¥8,950 税込 / EN: $89.50 + Tax）。Stripe に送信する決済金額（セント整数）は変更されません。表示レイヤーのみの変換です。

---

## 主要機能

### ストアフロント
- **商品カタログ** — カテゴリフィルター、価格ソート（安い順・高い順）、全文検索（`Prisma insensitive contains`）
- **商品詳細** — 画像ギャラリー、サイズ選択、在庫バリデーション（リアルタイム残数表示）、カスタマーレビュー（1〜5星評価＋コメント）
- **ショッピングカート** — 商品追加・数量変更・削除、ヘッダーのカートアイコンにリアルタイム個数バッジ
- **Stripe決済** — Stripe Hosted Checkout へリダイレクト、配送先住所収集（US / CA / GB）、セッション有効期限 30 分
- **注文履歴** — ステータスバッジ（保留中・確認済み・処理中・発送済み・配達済み・キャンセル）、支払いステータスバッジ

### 多言語対応（i18n）
- **言語トグル** — ヘッダーに `JP | EN` テキストリンク（検索アイコンとカートアイコンの間に配置）
- **Cookie ベースロケール** — `NEXT_LOCALE` Cookie（有効期限 1 年）、URL プレフィックスなし
- **ページリロードなし切替** — `useTransition` + `router.refresh()` による即時反映
- **通貨連動** — JP: `Intl.NumberFormat("ja-JP", { currency: "JPY" })` → ¥8,950 / EN: `Intl.NumberFormat("en-US", { currency: "USD" })` → $89.50
- **翻訳範囲** — ヘッダー、フッター、ホーム、商品一覧・詳細、レビュー、カート、チェックアウト、認証フォーム、注文履歴、管理画面全体（約 200 キー）
- **サーバー / クライアントコンポーネント対応** — Server Components は `getTranslations()`、Client Components は `useTranslations()` を使用

### 認証・認可
- **JWT セッション** — 24 時間有効のステートレスセッション（NextAuth.js v5）
- **Middleware ルート保護** — `/admin/*`、`/orders`、`/checkout`、`/cart` をエッジで保護
- **ロールベースアクセス制御** — ADMIN ロールのみ管理画面にアクセス可、CUSTOMER がアクセスすると `/` にリダイレクト
- **パスワードハッシュ** — bcrypt 12 ラウンド

### 管理画面
- **KPI カード** — 総売上、総注文数、平均注文額、新規顧客数（今月）
- **月次売上チャート** — 直近 6 ヶ月の棒グラフ（Recharts）、ロケール連動通貨記号
- **商品管理** — 作成・編集・削除の完全 CRUD（Zod バリデーション付きフォーム、ダイアログ UI）
- **注文管理** — ステータスライフサイクル更新（Pending → Confirmed → Processing → Shipped → Delivered）、セレクトボックスで即時変更
- **顧客一覧** — 顧客リスト（名前・メール・登録日・注文数表示）

---

## データベース設計

### Prisma スキーマ（9 モデル、3 enum）

```
User ──1:0..1──▶ Cart ──1:N──▶ CartItem ◀──N:1── Product
  │                                                   │
  ├──1:N──▶ Order ──1:N──▶ OrderItem ◀──N:1──────────┘
  │            │                                  │
  │            └──1:0..1──▶ ShippingAddress        │
  │                                                │
  └──1:N──▶ Review ◀──N:1─────────────────────────┘
                                                   │
                                          Category ─┘
```

**enum:**
- `Role` — CUSTOMER, ADMIN
- `OrderStatus` — PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- `PaymentStatus` — PENDING, PAID, FAILED, REFUNDED, EXPIRED

**価格戦略:**
- 全価格をセント整数で保存（例: $28.90 = 2890）
- 浮動小数点演算エラーの回避
- Stripe API のセント単位と整合

**インデックス:**
- `Order` — userId、status、createdAt にインデックス付与
- `OrderItem` — orderId、productId にインデックス付与

**シードデータ:** 2 ユーザー（Admin + Customer）、5 カテゴリ、20 商品、10 レビュー、5 注文（各ステータス 1 件ずつ）

---

## セキュリティ設計

| 脅威 | 対策 |
|:-----|:-----|
| パスワード漏洩 | bcrypt 12 ラウンドでハッシュ化 |
| セッションハイジャック | JWT 24 時間有効期限、ステートレス設計 |
| 不正アクセス | NextAuth Middleware によるルート保護、RBAC |
| Webhook 偽装 | Stripe 署名検証（`webhooks.constructEvent`） |
| SQLインジェクション | Prisma パラメータ化クエリ |
| クリックジャッキング | `X-Frame-Options: DENY` |
| MIME スニッフィング | `X-Content-Type-Options: nosniff` |
| 中間者攻撃 | `Strict-Transport-Security` 2 年、preload 付き |
| 情報漏洩 | `Referrer-Policy: strict-origin-when-cross-origin` |
| デバイスAPI悪用 | `Permissions-Policy: camera=(), microphone=(), geolocation=()` |
| 不正入力 | Zod スキーマによるランタイムバリデーション（全フォーム・API入力） |
| 過剰販売 | 楽観的在庫ロック（`$transaction` 内で `stock >= quantity` を検証） |

---

## プロジェクト構成

```
src/
├── app/                              # Next.js App Router
│   ├── admin/                        # 管理画面（ADMIN ロール限定）
│   │   ├── customers/page.tsx        #   顧客一覧
│   │   ├── orders/page.tsx           #   注文管理
│   │   ├── products/page.tsx         #   商品管理
│   │   ├── layout.tsx                #   管理画面レイアウト + RBAC チェック
│   │   └── page.tsx                  #   ダッシュボード（KPI + チャート）
│   ├── api/
│   │   ├── auth/[...nextauth]/       #   NextAuth エンドポイント
│   │   ├── checkout/route.ts         #   Stripe Session 作成 + 在庫ロック
│   │   └── webhooks/stripe/route.ts  #   Webhook ハンドラー（196行）
│   ├── cart/page.tsx                  # カートページ
│   ├── checkout/
│   │   ├── cancel/page.tsx           #   決済キャンセル
│   │   ├── success/page.tsx          #   決済完了（注文詳細表示）
│   │   └── page.tsx                  #   チェックアウト
│   ├── login/page.tsx                # ログイン
│   ├── orders/page.tsx               # 注文履歴
│   ├── products/
│   │   ├── [id]/page.tsx             #   商品詳細 + レビュー
│   │   └── page.tsx                  #   カタログ（フィルター + ソート）
│   ├── register/page.tsx             # 新規登録
│   └── layout.tsx                    # ルートレイアウト + NextIntlClientProvider
│
├── components/
│   ├── admin/                        # 管理画面コンポーネント（7ファイル）
│   ├── auth/                         # ログイン・登録フォーム
│   ├── cart/                         # カートアイテム、サマリー
│   ├── checkout/                     # チェックアウトフォーム
│   ├── layout/                       # ヘッダー、フッター、言語トグル、管理サイドバー
│   ├── orders/                       # 注文リスト、ステータスバッジ
│   ├── products/                     # カード、グリッド、フィルター、ギャラリー
│   ├── reviews/                      # レビューフォーム・リスト
│   └── ui/                           # shadcn/ui プリミティブ（14コンポーネント）
│
├── i18n/
│   ├── config.ts                     # ロケール定義（ja, en）、Cookie名
│   └── request.ts                    # next-intl リクエスト設定（Cookie読取）
│
├── messages/
│   ├── ja.json                       # 日本語翻訳（228行・約200キー）
│   └── en.json                       # 英語翻訳（228行・約200キー）
│
├── lib/
│   ├── actions/                      # Server Actions
│   │   ├── auth.ts                   #   登録（Zod検証 + bcrypt）、ログイン
│   │   ├── cart.ts                   #   カート CRUD（追加・更新・削除・カウント）
│   │   ├── locale.ts                 #   言語切替（Cookie設定）
│   │   ├── orders.ts                 #   注文ステータス更新（ADMIN限定）
│   │   ├── products.ts              #   商品 CRUD（ADMIN限定、Zod検証）
│   │   └── reviews.ts               #   レビュー作成（Zod検証）
│   ├── auth.config.ts                # NextAuth ルート設定 + RBAC コールバック
│   ├── auth.ts                       # NextAuth インスタンス（JWT + Credentials）
│   ├── constants.ts                  # ステータスラベル、色、サイズ、税率（10%）
│   ├── order-number.ts               # 注文番号生成（LUXE-YYYYMMDD-NNN）
│   ├── prisma.ts                     # Prisma シングルトン
│   ├── stripe.ts                     # Stripe シングルトン
│   ├── resend.ts                     # Resend シングルトン
│   └── utils.ts                      # cn()、formatPrice(cents, locale)、formatDate()
│
├── types/index.ts                    # 共有 TypeScript 型定義
└── middleware.ts                     # 認証ミドルウェア + ルートマッチャー

prisma/
├── schema.prisma                     # 9モデル、3 enum（152行）
├── seed.ts                           # シードスクリプト（497行）
└── migrations/                       # マイグレーション履歴
```

**合計:** TypeScript ソースコード 約 5,087 行 / ソースファイル 87 ファイル

---

## セットアップ

### 前提条件
- Node.js 18 以上
- PostgreSQL データベース（[Neon](https://neon.tech/) 推奨）
- [Stripe](https://stripe.com/) アカウント（テストモード）
- [Resend](https://resend.com/) アカウント

### 1. クローン・インストール

```bash
git clone https://github.com/mer-prog/luxe-store.git
cd luxe-store
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

```env
# データベース（Neon PostgreSQL）
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth.js
AUTH_SECRET="openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# メール（Resend）
RESEND_API_KEY="re_..."
EMAIL_FROM="LUXE Store <noreply@yourdomain.com>"

# アプリURL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# シードデータ（任意）
SEED_ADMIN_PASSWORD="change-me-admin"
SEED_USER_PASSWORD="change-me-user"
```

### 3. データベースセットアップ

```bash
npx prisma migrate dev    # マイグレーション適用
npm run db:seed            # サンプルデータ投入
```

### 4. Stripe Webhook リスナー起動（開発環境）

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセス。

### テストアカウント（シード後）

| ロール | メールアドレス | パスワード |
|:-------|:--------------|:-----------|
| 管理者 | `admin@example.com` | `SEED_ADMIN_PASSWORD` で設定した値 |
| 顧客 | `user@example.com` | `SEED_USER_PASSWORD` で設定した値 |

### npm スクリプト

| コマンド | 内容 |
|:---------|:-----|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm run db:push` | スキーマをDBに反映 |
| `npm run db:seed` | シードデータ投入 |
| `npm run db:migrate` | マイグレーション作成・適用 |

---

## 設計判断の根拠

| 判断 | 根拠 |
|:-----|:-----|
| **App Router（Pages Router ではなく）** | Server Components でクライアントバンドル削減、Server Actions で API ボイラープレート排除 |
| **JWT セッション（DB セッションではなく）** | ステートレス認証で水平スケール可能、セッションストア不要、24時間有効期限でセキュリティと UX を両立 |
| **Stripe Hosted Checkout（Elements ではなく）** | PCI 準拠が標準で含まれる、配送先住所収集が組み込み、カスタムフォーム面を削減 |
| **Webhook 駆動の注文処理** | 決済確認をユーザーセッションから分離、セッション期限切れ・決済失敗を非同期でハンドリング |
| **楽観的在庫ロック** | Stripe チェックアウト中の過剰販売を分散ロックなしで防止（`$transaction` 内で `stock >= quantity` を条件付き更新） |
| **Prisma（生SQL ではなく）** | 型安全クエリ + 自動生成型、スキーマファーストマイグレーション、Neon アダプターでサーバーレス対応 |
| **価格をセント整数で保存** | 浮動小数点演算エラーの回避、Stripe API のセント単位と整合 |
| **シングルトンパターン（Prisma / Stripe / Resend）** | サーバーレス環境・開発時ホットリロードでのコネクション枯渇を防止 |
| **ロケール連動通貨フォーマット** | 言語切替で通貨表示も連動（¥ ↔ $）、決済ロジック（セント整数）は不変。国際ECの標準パターン |
| **Cookie ベース i18n（URL プレフィックスなし）** | 商品 URL 構造（`/products/[id]`）を維持。デモ用ポートフォリオのため SEO より URL 簡潔さを優先 |

---

## 運用コスト

| サービス | プラン | 月額 |
|:---------|:-------|:-----|
| Vercel | Hobby | 無料 |
| Neon PostgreSQL | Free Tier | 無料 |
| Stripe | 従量課金 | 決済額の 3.6%（テストモードは無料） |
| Resend | Free Tier | 無料（月 3,000 通まで） |
| **合計** | | **$0（テストモード運用時）** |

---

## 作者

[@mer-prog](https://github.com/mer-prog)
