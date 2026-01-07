import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Music, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import AdminGalleryManager from "@/components/admin/AdminGalleryManager";
import AdminActivityReportManager from "@/components/admin/AdminActivityReportManager";
import AdminRevenueStats from "@/components/admin/AdminRevenueStats";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("gallery");

  // 管理者チェック
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive opacity-50" />
          <h1 className="text-2xl font-serif text-primary">アクセス拒否</h1>
          <p className="text-muted-foreground">
            このページは管理者のみアクセスできます
          </p>
          <Link href="/">
            <Button className="mt-4">ホームに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-serif text-lg italic">S</span>
                </div>
                <h1 className="text-xl font-serif italic text-primary">Setsuna Float</h1>
              </div>
            </Link>
            <div className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
              管理者モード
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                サイトを表示
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <section className="section-padding-sm border-b border-border">
        <div className="container space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif italic text-primary">
            管理者ダッシュボード
          </h1>
          <p className="text-lg text-muted-foreground">
            コンテンツ管理、売上確認、統計情報
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">限定画像管理</span>
                <span className="sm:hidden">画像</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">活動報告管理</span>
                <span className="sm:hidden">報告</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">売上・統計</span>
                <span className="sm:hidden">統計</span>
              </TabsTrigger>
            </TabsList>

            {/* Gallery Manager */}
            <TabsContent value="gallery" className="space-y-6">
              <AdminGalleryManager />
            </TabsContent>

            {/* Activity Report Manager */}
            <TabsContent value="activity" className="space-y-6">
              <AdminActivityReportManager />
            </TabsContent>

            {/* Revenue Stats */}
            <TabsContent value="revenue" className="space-y-6">
              <AdminRevenueStats />
            </TabsContent>
          </Tabs>
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
