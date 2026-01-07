import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function AdminGalleryManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images, isLoading, refetch } = trpc.gallery.getImages.useQuery();
  const uploadImageMutation = trpc.admin.uploadGalleryImage.useMutation({
    onSuccess: () => {
      toast.success("画像がアップロードされました");
      setTitle("");
      setDescription("");
      refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const deleteImageMutation = trpc.admin.deleteGalleryImage.useMutation({
    onSuccess: () => {
      toast.success("画像が削除されました");
      refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);

      // TODO: ここでS3アップロード処理を実装
      // 一旦、APIに送信するシミュレーション
      await uploadImageMutation.mutateAsync({
        title,
        description,
        fileSize: file.size,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="card-elegant space-y-6">
        <h2 className="text-2xl font-serif text-primary">新しい画像をアップロード</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              タイトル *
            </label>
            <Input
              placeholder="画像のタイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              説明
            </label>
            <Textarea
              placeholder="画像の説明を入力（オプション）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              画像ファイル *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center gap-2 mx-auto"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : (
                  <Upload className="w-8 h-8 text-primary" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isUploading ? "アップロード中..." : "クリックして画像を選択"}
                </span>
              </button>
            </div>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !title.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                アップロード中...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                画像をアップロード
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Images List */}
      <div className="card-elegant space-y-6">
        <h2 className="text-2xl font-serif text-primary">アップロード済み画像</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : images && images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="border border-border rounded-lg overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  {image.thumbnailS3Key ? (
                    <img
                      src={image.thumbnailS3Key}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">画像プレビュー</div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif text-primary line-clamp-2">{image.title}</h3>
                    {image.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {image.description}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {new Date(image.createdAt).toLocaleDateString("ja-JP")}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("この画像を削除してもよろしいですか？")) {
                        deleteImageMutation.mutate({ imageId: image.id });
                      }
                    }}
                    disabled={deleteImageMutation.isPending}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>アップロード済み画像がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
