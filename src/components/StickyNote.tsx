import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StickyNoteProps {
  color: "blue" | "orange" | "red" | "yellow" | "purple";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StickyNote = ({ color, children, onClick, className }: StickyNoteProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return "bg-note-red/80 text-white";
      case "blue":
        return "bg-note-blue/80 text-white";
      case "yellow":
        return "bg-note-yellow/80 text-gray-800";
      case "orange":
        return "bg-note-orange/80 text-gray-800";
      case "purple":
        return "bg-purple-500/80 text-white";
      default:
        return "bg-note-blue/80 text-white";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-4 rounded-lg shadow-lg backdrop-blur-sm cursor-pointer transition-colors",
        "border border-white/20",
        getColorClasses(color),
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
