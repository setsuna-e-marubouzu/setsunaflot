# セツナフロート公式サイト

Airtable を中心に据えた会員制デジタルコンテンツ販売プラットフォーム。Stripe 決済、会員限定ページ、自動配送機能を備えています。

## 🎨 デザイン

ダークモードをベースに、シアン（#00D9FF）とパープル（#9D4EDD）をアクセントカラーとした、透明感のあるモダンなUIを採用しています。

## 🏗️ アーキテクチャ

### フロントエンド
- **Home.tsx**: トップページ（一般向け商品、YouTube/SNS埋め込み、会員登録ボタン）
- **Secret.tsx**: 会員限定ページ（パスワード認証、会員限定商品・コンテンツ）
- **Thanks.tsx**: 購入完了ページ

### バックエンド
- **airtable.ts**: Airtable API クライアント（Products、Settings、SecretContent テーブル対応）
- **stripe.ts**: Stripe API クライアント（決済・サブスクリプション対応）
- **webhooks.ts**: Stripe Webhook エンドポイント（SalesCount 自動更新、オーナー通知）
- **routers.ts**: tRPC 手続き定義

## 📋 Airtable テーブル構成

### Products テーブル
| フィールド | 型 | 説明 |
|-----------|-----|------|
| Name | Text | 商品名 |
| Price | Number | 価格（円） |
| PriceID | Text | Stripe Price ID |
| Image | Attachment | 商品画像 |
| DownloadURL | URL | ダウンロードURL |
| IsMemberOnly | Checkbox | 会員限定フラグ |
| SalesCount | Number | 販売数（自動更新） |

### Settings テーブル
| フィールド | 型 | 説明 |
|-----------|-----|------|
| SettingKey | Text | 設定キー（例：SecretPassword） |
| SettingValue | Text | 設定値 |

### SecretContent テーブル
| フィールド | 型 | 説明 |
|-----------|-----|------|
| Title | Text | コンテンツタイトル |
| Content | Long Text | テキストコンテンツ |
| AudioURL | URL | 音声ファイルURL |
| Type | Single Select | コンテンツタイプ（audio/text） |

## 🔐 環境変数

本番デプロイ時に Management UI から以下を設定してください：

```env
AIRTABLE_API_KEY=<Airtable API Key>
AIRTABLE_BASE_ID=<Base ID>
STRIPE_SECRET_KEY=<Stripe Secret Key>
STRIPE_WEBHOOK_SECRET=<Stripe Webhook Secret>
SECRET_PASSWORD=<会員ページのパスワード>
```

## 🚀 デプロイ後の設定

### Stripe Webhook 登録
1. Stripe Dashboard にアクセス
2. **Developers** → **Webhooks** に移動
3. **Add endpoint** をクリック
4. エンドポイント URL: `https://yourdomain.com/api/webhooks/stripe`
5. イベント選択: `checkout.session.completed`
6. Webhook Secret をコピーして環境変数に設定

## 🔄 決済フロー

1. ユーザーが商品を選択して「購入する」をクリック
2. Stripe Checkout セッション作成（Metadata に recordId・商品名を含める）
3. Stripe Checkout ページにリダイレクト
4. 決済完了後、サンクスページ（/thanks）に遷移
5. Webhook 受信時に Airtable SalesCount を自動更新
6. オーナーに購入通知を送信

## 🔑 会員認証フロー

1. ユーザーが `/secret` にアクセス
2. パスワード認証フォームを表示
3. Airtable Settings テーブルから正しいパスワードを取得
4. 入力されたパスワードと比較
5. 認証成功時、sessionStorage に状態を保存
6. 会員限定コンテンツ・商品を表示

## 🧪 テスト

```bash
pnpm test
```

ユニットテスト：
- Airtable API クライアント（フィルタリング、エラーハンドリング）
- Stripe クライアント（セッション作成、Webhook 検証）
- 認証ロジック

## 📦 本番デプロイ

```bash
pnpm build
pnpm start
```

## 🛠️ トラブルシューティング

### Airtable API エラー
- API Key が正しいか確認
- Base ID が正しいか確認
- テーブル名のスペルが正確か確認

### Stripe エラー
- Publishable Key と Secret Key が一致しているか確認
- Price ID が正しいか確認
- Webhook Secret が正しいか確認

### 会員ページにアクセスできない
- パスワードが Airtable Settings テーブルに正しく設定されているか確認
- sessionStorage がブラウザで有効か確認

## 📞 サポート

問題が発生した場合は、ブラウザのコンソールでエラーメッセージを確認してください。
