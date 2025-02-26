import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className={cn(
        "relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-black",
        "flex items-center justify-center bg-white/80 backdrop-blur-sm",
        "transition-transform hover:scale-105",
        className
      )}>
        <span className="text-lg sm:text-xl font-mono font-bold">eth0</span>
      </div>
    </div>
  );
};
