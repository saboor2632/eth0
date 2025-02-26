import { useState } from "react";
import { Logo } from "@/components/Logo";
import { StickyNote } from "@/components/StickyNote";
import { AIResponse } from "@/components/AIResponse";
import { InputArea } from "@/components/InputArea";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingButton {
  label: string;
  action: () => void;
}

const Index = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("AI response will appear here...");
  const [selectedDataset, setSelectedDataset] = useState<"bounties" | "vitalik" | "rekt" | "ethdenver">("ethdenver");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input || !selectedDataset) return;

    setIsLoading(true);
    setResponse("Processing your request...");

    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: input,
                chat_type: selectedDataset,
                num_chunks: 30
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.Answer) {
            setResponse(data.Answer);
        } else if (data.error) {
            setResponse(`Error: ${data.error}`);
        } else {
            setResponse('Received unexpected response format from server');
        }
        
        // Log the full response for debugging
        console.log('Full API Response:', data);
        
    } catch (error) {
        console.error('Detailed error:', error);
        if (error instanceof Error) {
            setResponse(`Error: ${error.message}`);
        } else {
            setResponse('Error: Failed to get response from AI');
        }
    } finally {
        setIsLoading(false);
        setInput("");
    }
  };

  const handleAction = async (question: string) => {
    if (!selectedDataset) return;
    
    setIsLoading(true);
    setResponse("Processing your request...");

    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                chat_type: selectedDataset,
                num_chunks: 30
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.Answer) {
            setResponse(data.Answer);
        } else if (data.error) {
            setResponse(`Error: ${data.error}`);
        } else {
            setResponse('Received unexpected response format from server');
        }
        
        // Log the full response for debugging
        console.log('Full API Response:', data);
        
    } catch (error) {
        console.error('Detailed error:', error);
        if (error instanceof Error) {
            setResponse(`Error: ${error.message}`);
        } else {
            setResponse('Error: Failed to get response from AI');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const getFloatingButtons = (): FloatingButton[] => {
    switch (selectedDataset) {
      case "bounties":
        return [
          { 
            label: "ETH Bounties", 
            action: () => handleAction(
              "I want to explore ETH Global bounties and hackathon opportunities. For this conversation, focus on providing specific, actionable information about bounties, requirements, and winning strategies. Let's start with: What are some current interesting ETH bounties?"
            ) 
          },
          { 
            label: "Winning ideas", 
            action: () => handleAction(
              "I want to understand what makes hackathon projects successful. For this conversation, analyze patterns from past winning projects and provide strategic advice. Let's begin with: What are the key elements that make a hackathon project stand out?"
            ) 
          }
        ];
      case "vitalik":
        return [
          { 
            label: "Jam with Vitalik", 
            action: () => handleAction(
              "Let's have a technical brainstorming session. For this conversation, embody Vitalik's technical mindset and focus on deep technical discussions about blockchain architecture, scalability, and implementation details. First question: What are the most interesting technical challenges in Ethereum's roadmap?"
            ) 
          },
          { 
            label: "Get Vitalik's perspective", 
            action: () => handleAction(
              "I'd like to understand Vitalik's strategic vision. For this conversation, focus on providing insights about Ethereum's ecosystem, governance, and future directions, drawing from Vitalik's writings and perspectives. Let's start with: What do you see as Ethereum's most crucial developments in the next few years?"
            ) 
          }
        ];
      case "rekt":
        return [
          { 
            label: "Security Analysis", 
            action: () => handleAction(
              "Let's focus on security analysis. For this conversation, provide detailed technical security insights based on past incidents and vulnerabilities. Draw from the REKT database to offer specific examples and lessons learned. First question: What are the most critical security vulnerabilities that keep appearing in DeFi protocols?"
            ) 
          },
          { 
            label: "Risk Assessment", 
            action: () => handleAction(
              "I want to understand DeFi risk assessment. For this conversation, focus on providing practical security advice and risk mitigation strategies, using real examples from past incidents. Let's begin with: What are the essential security practices every DeFi project should implement?"
            ) 
          }
        ];
      case "ethdenver":
        return [
          { 
            label: "Prize Info", 
            action: () => handleAction(
              "Tell me about the prize tracks and bounties available at ETHDenver 2025. What are the major prize categories and amounts? Please provide specific details about the prize pools, sponsor prizes, and any special requirements or criteria for winning."
            ) 
          },
          { 
            label: "Event Details", 
            action: () => handleAction(
              "What are the key dates, requirements, and logistics for ETHDenver 2025? Please include information about registration deadlines, team formation rules, the main event schedule, and any important venue details or participant requirements."
            ) 
          }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 bg-[url('/noise.png')] bg-repeat">
      <div className="container mx-auto px-4 py-4 sm:py-8 flex flex-col min-h-screen">
        <div className="flex justify-between items-start">
          <Logo className="z-10" />
          <div className="relative flex items-center">
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  "text-sm sm:text-base text-gray-800 transition-all duration-300",
                  isMenuOpen ? "-translate-x-28" : "translate-x-0"
                )}
              >
                Menu
              </span>
              <span 
                className={cn(
                  "absolute transition-all duration-300 text-black",
                  "text-sm sm:text-base tracking-wide",
                  isMenuOpen 
                    ? "-translate-x-16 opacity-100" 
                    : "translate-x-8 opacity-0"
                )}
              >
                Login
              </span>
              <span 
                className={cn(
                  "absolute transition-all duration-300 text-black",
                  "text-sm sm:text-base tracking-wide",
                  isMenuOpen 
                    ? "-translate-x-4 opacity-100" 
                    : "translate-x-8 opacity-0"
                )}
              >
                About
              </span>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative hover:opacity-80 transition-opacity ml-1"
              >
                <div className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 shadow-sm",
                  isMenuOpen 
                    ? "border-2 border-black bg-transparent" 
                    : "bg-black"
                )} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 mt-8 flex-1">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col gap-8 w-full lg:w-64"
          >
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-4">Brainstorm</h2>
              <div className="space-y-3">
                <StickyNote 
                  color="purple"
                  onClick={() => setSelectedDataset("ethdenver")}
                >
                  Chat w/ ETHDenver 2025
                </StickyNote>
                <StickyNote 
                  color="red" 
                  onClick={() => setSelectedDataset("vitalik")}
                >
                  Brainstorm with Vitalik AI
                </StickyNote>
                <StickyNote 
                  color="yellow" 
                  onClick={() => setSelectedDataset("bounties")}
                >
                  Chat w/ ETHGlobal Bounties
                </StickyNote>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-4">Code</h2>
              <div className="space-y-3">
                <StickyNote 
                  color="blue" 
                  onClick={() => setSelectedDataset("rekt")}
                >
                  Audit with REKT AI
                </StickyNote>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col flex-1">
            <div className="flex-1 bg-white rounded-xl p-6 shadow-sm mb-4 lg:min-h-0 min-h-[60vh] relative">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <p className="text-gray-500">Processing your request...</p>
                </div>
              ) : (
                <p className="text-gray-500">{response}</p>
              )}
              
              {/* Floating Buttons */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                {getFloatingButtons().map((button, index) => (
                  <motion.button
                    key={button.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={button.action}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium shadow-lg",
                      "backdrop-blur-sm transition-all hover:scale-105",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      selectedDataset === "vitalik" 
                        ? "bg-red-400/90 text-white hover:bg-red-500/90"
                        : selectedDataset === "ethdenver"
                          ? "bg-purple-500/90 text-white hover:bg-purple-600/90"
                          : "bg-yellow-100/90 text-gray-800 hover:bg-yellow-200/90"
                    )}
                    disabled={isLoading}
                  >
                    {button.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="input-container">
              <InputArea 
                value={input} 
                onChange={setInput} 
                onSubmit={handleSubmit}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
