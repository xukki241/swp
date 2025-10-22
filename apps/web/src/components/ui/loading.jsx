import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Loading({
  fullscreen = false,
  className,
  text = "Loading PharmaFlow...",
}) {
  if (fullscreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-100"></div>
            <Loader2 className="h-16 w-16 animate-spin text-primary absolute top-0 left-0" />
          </div>
          <p className="text-muted-foreground font-medium">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin", className)}
      aria-label="Loading"
    />
  );
}
