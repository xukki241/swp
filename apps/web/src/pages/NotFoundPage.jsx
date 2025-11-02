import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Không tìm thấy trang
          </h2>
          <p className="text-muted-foreground text-base">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-white rounded-lg h-11 px-6"
          >
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Về Tổng quan
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-lg h-11 px-6 bg-transparent"
          >
            <Link to="/">Về Trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
