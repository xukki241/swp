import { Activity, Calendar, Clock } from "lucide-react";

export function WelcomeBanner({ userName, greeting }) {
  const currentDate = new Date();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-xl overflow-hidden relative">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/5 animate-pulse delay-300"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold animate-in slide-in-from-left duration-500">
            {greeting}, {userName}! 👋
          </h2>
          <p className="mt-2 text-base md:text-lg text-primary-foreground/90 animate-in slide-in-from-left duration-700">
            Here's what's happening with your pharmacy today
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm animate-in slide-in-from-left duration-1000">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Clock className="h-4 w-4" />
              <span>
                {currentDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Animated icon */}
        <div className="hidden md:block animate-in zoom-in duration-700">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-white/30 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-sm">
              <Activity className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
