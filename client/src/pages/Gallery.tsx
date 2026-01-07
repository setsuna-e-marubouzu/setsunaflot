import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Lock, ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Gallery() {
  const { user, isAuthenticated } = useAuth();
  const { data: images, isLoading } = trpc.gallery.getImages.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex items-center justify-between py-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-serif text-lg italic">S</span>
                </div>
                <h1 className="text-xl font-serif italic text-primary">Setsuna Float</h1>
              </div>
            </Link>
            <a href={getLoginUrl()}>
              <Button className="bg-primary text-primary-foreground hover:opacity-90">
                ログイン
              </Button>
            </a>
          </div>
        </nav>

        {/* Auth Required Message */}
        <section className="section-padding gradient-pastel">
          <div className="container text-center space-y-8">
            <div className="space-y-4">
              <Lock className="w-16 h-16 mx-auto text-primary opacity-50" />
              <h1 className="text-4xl md:text-5xl font-serif italic text-primary">
                限定ギャラリー
              </h1>
              <p className="text-xl text-muted-foreground">
                このコンテンツはサブスク会員限定です
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              セツナフロートの限定画像をご覧いただくには、サブスク会員登録が必要です。
              ログインして、特別な世界観をお楽しみください。
            </p>

            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90">
                ログインして会員になる
              </Button>
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-serif text-lg italic">S</span>
              </div>
              <h1 className="text-xl font-serif italic text-primary">Setsuna Float</h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/shop">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                画像販売
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">{user?.name || "プロフィール"}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <section className="section-padding-sm border-b border-border">
        <div className="container space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif italic text-primary">
            限定ギャラリー
          </h1>
          <p className="text-lg text-muted-foreground">
            会員限定の未公開画像をご覧いただけます
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="card-elegant overflow-hidden group">
                  {/* Thumbnail Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                    {image.thumbnailS3Key ? (
                      <img
                        src={image.thumbnailS3Key}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <Lock className="w-8 h-8 mx-auto text-primary/50" />
                        <p className="text-sm text-muted-foreground">画像プレビュー</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-serif text-primary line-clamp-2">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border mt-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      {new Date(image.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10"
                      disabled
                    >
                      詳細を見る
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-lg text-muted-foreground">
                現在、利用可能な画像はありません
              </p>
              <p className="text-sm text-muted-foreground">
                新しいコンテンツは随時追加予定です
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Setsuna Float Fan Site. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
