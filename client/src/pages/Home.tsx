import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, Lock, Music, Image, TrendingUp } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-lg italic">S</span>
            </div>
            <h1 className="text-xl font-serif italic text-primary">Setsuna Float</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-foreground hover:text-primary">
                    ダッシュボード
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">{user?.name || "プロフィール"}</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-primary text-primary-foreground hover:opacity-90">
                  ログイン
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding gradient-pastel relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-serif italic text-primary leading-tight">
                セツナフロート
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                限定コンテンツで応援する、新しいファンクラブ体験
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              会員限定の未公開画像、音声付き活動報告、そして個別画像販売を通じて、
              セツナフロートを直接サポート。夢のような世界観に包まれた特別な体験をお届けします。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/gallery">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                    ギャラリーを見る <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                    今すぐ始める <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <Link href="/activity">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  活動報告を読む
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif text-primary">
              特別な体験をお届けします
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              セツナフロートを応援する皆様へ、限定コンテンツと特別な機能をご用意しています
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="card-elegant space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary">限定ギャラリー</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                会員限定の未公開画像をいち早くご覧いただけます。毎月新しいコンテンツを追加予定です。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-elegant space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary">活動報告</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                音声とテキストで最新の活動情報をお届け。全ユーザーが無料でご覧いただけます。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-elegant space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary">画像販売</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                気に入った画像を個別購入できます。ウォーターマーク付きで安全に配信されます。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-elegant space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary">直接応援</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                サブスク登録と画像購入で、セツナフロートを直接サポートできます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="section-padding bg-card/30">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif text-primary">
              サブスクリプションプラン
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              月額制で限定コンテンツにアクセスできます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Plan 1 */}
            <div className="card-elegant border-2 border-primary/20 space-y-6">
              <div>
                <h3 className="text-2xl font-serif text-primary mb-2">スタンダード</h3>
                <p className="text-sm text-muted-foreground">基本的な限定コンテンツ</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-serif text-primary">
                  ¥5,000<span className="text-lg text-muted-foreground font-sans">/月</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>限定ギャラリーへのアクセス</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>月2回の活動報告</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>画像販売割引（10%OFF）</span>
                </li>
              </ul>
              {isAuthenticated ? (
                <Link href="/subscription">
                  <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                    今すぐ登録
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                    ログインして登録
                  </Button>
                </a>
              )}
            </div>

            {/* Plan 2 */}
            <div className="card-elegant border-2 border-accent space-y-6 relative">
              <div className="absolute -top-3 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                おすすめ
              </div>
              <div>
                <h3 className="text-2xl font-serif text-primary mb-2">プレミアム</h3>
                <p className="text-sm text-muted-foreground">最高の体験を</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-serif text-primary">
                  ¥7,000<span className="text-lg text-muted-foreground font-sans">/月</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>スタンダードの全機能</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>月4回の活動報告</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>画像販売割引（20%OFF）</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>プレミアム限定コンテンツ</span>
                </li>
              </ul>
              {isAuthenticated ? (
                <Link href="/subscription">
                  <Button className="w-full bg-accent text-accent-foreground hover:opacity-90">
                    プレミアムに登録
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="w-full bg-accent text-accent-foreground hover:opacity-90">
                    ログインして登録
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-sm gradient-pastel">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif text-primary">
            セツナフロートを応援しましょう
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            限定コンテンツで直接サポート。あなたの応援がセツナフロートの力になります。
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                今すぐ始める <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container text-center text-sm text-muted-foreground space-y-4">
          <p>© 2026 Setsuna Float Fan Site. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy">
              <span className="hover:text-primary transition-colors cursor-pointer">プライバシーポリシー</span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-primary transition-colors cursor-pointer">利用規約</span>
            </Link>
            <Link href="/contact">
              <span className="hover:text-primary transition-colors cursor-pointer">お問い合わせ</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
