import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Music, Loader2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ActivityReports() {
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data: reports, isLoading } = trpc.activityReports.getReports.useQuery({
    limit,
    offset: page * limit,
  });

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
            <Link href="/gallery">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                ギャラリー
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                ホーム
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <section className="section-padding-sm border-b border-border">
        <div className="container space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif italic text-primary">
            活動報告
          </h1>
          <p className="text-lg text-muted-foreground">
            セツナフロートの最新情報をお届けします（全ユーザー無料）
          </p>
        </div>
      </section>

      {/* Reports List */}
      <section className="section-padding">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-8">
              {reports.map((report) => (
                <article key={report.id} className="card-elegant space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-serif text-primary">
                      {report.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                      {report.content}
                    </p>
                  </div>

                  {/* Audio Player */}
                  {report.audioS3Key && (
                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Music className="w-4 h-4" />
                        <span className="text-sm font-medium">音声付き報告</span>
                      </div>
                      <audio
                        controls
                        className="w-full"
                        src={report.audioS3Key}
                      >
                        お使いのブラウザは音声再生に対応していません
                      </audio>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-border pt-4">
                    <Link href={`/activity/${report.id}`}>
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        詳細を読む
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 pt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  前へ
                </Button>
                <span className="text-sm text-muted-foreground">
                  ページ {page + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={!reports || reports.length < limit}
                >
                  次へ
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-lg text-muted-foreground">
                現在、活動報告はありません
              </p>
              <p className="text-sm text-muted-foreground">
                新しい報告は随時追加予定です
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
