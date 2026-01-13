# セツナフロート公式サイト - TODO

## Phase 1: プロジェクト設定・環境変数・API基礎実装
- [x] 環境変数の設定（AIRTABLE_API_KEY、AIRTABLE_BASE_ID、Stripe keys、SECRET_PASSWORD）
- [x] Airtable API連携の基盤実装（Products、Settings、SecretContent テーブル取得）
- [x] Stripe API連携の基盤実装
- [x] ダークモード + シアン/パープルアクセントのデザイン基盤（index.css、Tailwind設定）

## Phase 2: トップページ実装
- [x] 一般向け商品カード表示（IsMemberOnly=OFF の商品）
- [x] YouTube/SNS埋め込みセクション
- [x] 月額会員登録ボタン（Stripe Subscription PriceID へ誘導）
- [x] レスポンシブレイアウト
- [x] Suspense でラップしたデータ取得

## Phase 3: Stripe Checkout 統合
- [x] 商品購入ボタンの実装
- [x] Stripe Checkout セッション作成（Metadata に recordId と商品名を含める）
- [x] サンクスページ（/thanks）実装
- [x] ダウンロードURL表示機能

## Phase 4: 会員限定ページ（/secret）実装
- [x] パスワード認証フォーム
- [x] Airtable Settings テーブルからのパスワード取得・検証
- [x] 会員限定商品表示（IsMemberOnly=ON の商品）
- [x] SecretContent テーブルからの音声・テキストコンテンツ表示
- [x] セッション管理（パスワード認証後の状態保持）

## Phase 5: Stripe Webhook 実装
- [x] Webhook エンドポイント実装（/api/webhooks/stripe）
- [x] Stripe イベント検証
- [x] Airtable SalesCount フィールド自動更新
- [x] オーナーへの通知送信

## Phase 6: 最終確認・デバッグ
- [ ] 全機能の動作確認
- [ ] エラーハンドリング・ユーザーフィードバック
- [ ] パフォーマンス最適化
- [ ] セキュリティレビュー
- [ ] ユーザーへの納品
