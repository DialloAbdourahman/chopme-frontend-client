import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          size={48}
          className="text-primary animate-spin"
          aria-hidden="true"
        />
        <p className="text-base sm:text-lg font-medium text-text">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
