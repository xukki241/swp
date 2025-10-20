import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading state component
 */
export function LoadingState() {
  return (
    <Card className="shadow-md rounded-xl border-0">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component
 * @param {Object} props
 * @param {Error} props.error - Error object
 * @param {Function} props.onRetry - Retry handler
 */
export function ErrorState({ error, onRetry }) {
  return (
    <Card className="shadow-md rounded-xl border-0">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h3>
          <p className="text-sm text-muted-foreground">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load users"}
          </p>
          <Button onClick={onRetry} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
