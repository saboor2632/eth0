import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const InputArea = ({ value, onChange, onSubmit, disabled }: InputAreaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex gap-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "flex-1 min-h-[100px] p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          placeholder="Type your message here..."
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSubmit}
          disabled={disabled}
          className={cn(
            "self-end p-3 bg-note-blue text-white rounded-lg hover:bg-note-blue/90 transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
