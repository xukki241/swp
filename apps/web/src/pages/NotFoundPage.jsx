import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  function handleGoHome() {
    navigate("/dashboard");
  }

  function handleGoBack() {
    navigate(-1);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-6 text-8xl font-bold text-primary/20">
              404
            </div>
            <CardTitle className="text-3xl mb-2">Page Not Found</CardTitle>
            <CardDescription className="text-base">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleGoHome} className="flex-1">
                Go to Dashboard
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
