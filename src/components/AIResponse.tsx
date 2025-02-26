
import { motion } from "framer-motion";

interface AIResponseProps {
  response: string;
}

export const AIResponse = ({ response }: AIResponseProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[60vh] bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg overflow-auto"
    >
      <pre className="whitespace-pre-wrap font-sans text-gray-800">{response}</pre>
    </motion.div>
  );
};
