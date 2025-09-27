import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFoundPage() {
  const navigate = useNavigate();

  function handleGoHome() {
    navigate("/dashboard");
  }

  function handleGoBack() {
    navigate(-1);
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="pb-2 text-center">
            <div className="text-primary/20 mx-auto mb-6 text-8xl font-bold">
              404
            </div>
            <CardTitle className="mb-2 text-3xl">Page Not Found</CardTitle>
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
