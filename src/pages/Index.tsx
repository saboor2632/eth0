import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { StickyNote } from "@/components/StickyNote";
import { AIResponse } from "@/components/AIResponse";
import { InputArea } from "@/components/InputArea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface FloatingButton {
  label: string;
  action: () => void;
}

interface ChatHistory {
  ethdenver: string[];
  vitalik: string[];
  bounties: string[];
  rekt: string[];
}

interface Bounty {
  name: string;
  amount: string;
  description: string;
}

interface SponsorProject {
  name: string;
  color: string;
  amount: string;
  bounties: Bounty[];
}

// Remove the styled-components import and replace with CSS animation
const floatingAnimation = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

const Index = () => {
  const [input, setInput] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<"bounties" | "vitalik" | "rekt" | "ethdenver">("ethdenver");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("You are chatting with ETHDenver 2025");
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    ethdenver: [],
    vitalik: [],
    bounties: [],
    rekt: []
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedBounties, setSelectedBounties] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<SponsorProject | null>(null);
  const [isVitalikActive, setIsVitalikActive] = useState(false);
  const [hasVitalikBeenCalled, setHasVitalikBeenCalled] = useState(false);
  const [showVitalikBubbles, setShowVitalikBubbles] = useState(true);
  const [showRektBubbles, setShowRektBubbles] = useState(true);
  
  const sponsorProjects: SponsorProject[] = [
    {
      name: "ETHDenver 2025",
      amount: "$80K",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Best DeFi Integration", amount: "$20K", description: "Create innovative DeFi solutions" },
        { name: "Social Impact", amount: "$15K", description: "Projects focusing on social good" },
        // ... more bounties
      ]
    },
    {
      name: "Polkadot",
      amount: "$10K",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "Cross-chain Integration", amount: "$5K", description: "Build cross-chain applications" },
        // ... more bounties
      ]
    },
    // ... more projects
  ];

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Update status message when dataset changes or loading state changes
  useEffect(() => {
    if (!isLoading) {
      const newStatus = `You are chatting with ${
        selectedDataset === "ethdenver" ? "ETHDenver 2025" :
        selectedDataset === "vitalik" ? "Vitalik AI" :
        selectedDataset === "bounties" ? "ETHGlobal Bounties" :
        "REKT AI"
      }`;
      setStatusMessage(newStatus);
    }
  }, [selectedDataset, isLoading]);

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatusMessage("Processing your request...");

    try {
      const response = await fetch('http://localhost:8000/api/query', {
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
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], data.Answer]
        }));
      } else if (data.error) {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], `Error: ${data.error}`]
        }));
      } else {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], 'Received unexpected response format from server']
        }));
      }
      
      // Log the full response for debugging
      console.log('Full API Response:', data);
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], `Error: ${error.message}`]
        }));
      } else {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], 'Error: Failed to get response from AI']
        }));
      }
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleAction = async (question: string) => {
    if (!selectedDataset) return;
    
    setIsLoading(true);
    setStatusMessage("Processing your request...");

    try {
      const response = await fetch('http://localhost:8000/api/query', {
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
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], data.Answer]
        }));
      } else if (data.error) {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], `Error: ${data.error}`]
        }));
      } else {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], 'Received unexpected response format from server']
        }));
      }
      
      // Log the full response for debugging
      console.log('Full API Response:', data);
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], `Error: ${error.message}`]
        }));
      } else {
        setChatHistory(prev => ({
          ...prev,
          [selectedDataset]: [...prev[selectedDataset], 'Error: Failed to get response from AI']
        }));
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

  const handleTabClick = (dataset: "ethdenver" | "vitalik" | "bounties" | "rekt") => {
    setSelectedDataset(dataset);
  };

  const handleProjectClick = (project: SponsorProject) => {
    setCurrentProject(project);
    setIsDialogOpen(true);
  };

  const handleBountySelect = (bountyName: string, projectName: string) => {
    setSelectedBounties(prev => {
      const bountyId = `${projectName}:${bountyName}`;
      const updated = prev.includes(bountyId) 
        ? prev.filter(b => b !== bountyId)
        : [...prev, bountyId];
      
      // Update input field with selected bounties with project names
      if (updated.length > 0) {
        const bountyList = updated.map(b => {
          const [project, bounty] = b.split(':');
          return `${bounty} (${project})`;
        }).join(", ");
        setInput(`I want to create a project using ${bountyList} bounties.`);
      } else {
        setInput("");
      }
      
      return updated;
    });
  };

  const isProjectSelected = (projectName: string) => {
    return selectedBounties.some(b => b.startsWith(`${projectName}:`));
  };

  const handleVitalikClick = () => {
    if (!hasVitalikBeenCalled) {
      // First time activation
      setHasVitalikBeenCalled(true);
      setIsVitalikActive(true);
      setChatHistory(prev => ({
        ...prev,
        [selectedDataset]: [...prev[selectedDataset], {
          type: 'system',
          content: 'Vitalik AI has entered the chat'
        }]
      }));
      setInput("Hi Vitalik AI, would you mind reviewing my project proposal above?");
    } else {
      // Toggle active state
      const newActiveState = !isVitalikActive;
      setIsVitalikActive(newActiveState);
      
      // Add appropriate message based on new state
      setChatHistory(prev => ({
        ...prev,
        [selectedDataset]: [...prev[selectedDataset], {
          type: 'system',
          content: newActiveState 
            ? 'Vitalik AI has entered the chat'
            : 'Vitalik AI has left the chat'
        }]
      }));
    }
  };

  const handleVitalikBubbleClick = (type: 'jam' | 'perspective') => {
    const prompt = type === 'jam'
      ? "Hi Vitalik, I'd love to brainstorm and explore an idea with you."
      : "Hi Vitalik, I'd appreciate your perspective on something.";
    
    setInput(prompt);
    setShowVitalikBubbles(false);
  };

  const handleRektBubbleClick = (type: 'security' | 'risk') => {
    const prompt = type === 'security'
      ? "Let's focus on security analysis. For this conversation, provide detailed technical security insights based on past incidents and vulnerabilities. Draw from the REKT database to offer specific examples and lessons learned. First question: What are the most critical security vulnerabilities that keep appearing in DeFi protocols?"
      : "I want to understand DeFi risk assessment. For this conversation, focus on providing practical security advice and risk mitigation strategies, using real examples from past incidents. Let's begin with: What are the essential security practices every DeFi project should implement?";
    
    setInput(prompt);
    setShowRektBubbles(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      handleSubmit();
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
                  onClick={() => handleTabClick("ethdenver")}
                  isSelected={selectedDataset === "ethdenver"}
                >
                  Chat w/ ETHDenver 2025
                </StickyNote>
                <StickyNote 
                  color="red" 
                  onClick={() => handleTabClick("vitalik")}
                  isSelected={selectedDataset === "vitalik"}
                >
                  Brainstorm with Vitalik AI
                </StickyNote>
                <StickyNote 
                  color="yellow" 
                  onClick={() => handleTabClick("bounties")}
                  isSelected={selectedDataset === "bounties"}
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
                  onClick={() => handleTabClick("rekt")}
                  isSelected={selectedDataset === "rekt"}
                >
                  Audit with REKT AI
                </StickyNote>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col flex-1">
            <div className="flex-1 bg-white rounded-xl p-6 shadow-sm mb-4 lg:min-h-0 min-h-[60vh] relative">
              {/* Status message at top */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                <p className="centered-text bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 whitespace-nowrap">
                  {isLoading ? "Processing your request..." : statusMessage}
                </p>
              </div>

              {/* Chat container with adjusted padding based on tab */}
              <div 
                ref={chatContainerRef}
                className={cn(
                  "absolute top-20 left-6 right-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-gray-100",
                  // Adjust bottom space based on tab
                  (selectedDataset === "ethdenver" || selectedDataset === "bounties")
                    ? "bottom-32" // More space for bounties panel
                    : "bottom-[0.2rem]" // Minimal space for REKT and Vitalik tabs
                )}
              >
                <AnimatePresence>
                  {chatHistory[selectedDataset].map((msg, index) => (
                    <motion.div
                      key={`${selectedDataset}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mb-4"
                    >
                      {typeof msg === 'object' && msg.type === 'system' ? (
                        <div className="flex justify-center mt-4 mb-4">
                          <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 whitespace-nowrap">
                            {msg.content}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 
                          prose prose-sm prose-headings:text-gray-800 
                          prose-p:text-gray-600 prose-p:leading-relaxed 
                          prose-strong:text-gray-700 prose-strong:font-semibold
                          prose-code:text-gray-800 prose-code:bg-gray-100/80
                          prose-a:text-blue-600 hover:prose-a:text-blue-700
                          shadow-sm"
                        >
                          <ReactMarkdown>{msg}</ReactMarkdown>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Bounties panel - only for ETHDenver and Bounties tabs */}
              {(selectedDataset === "ethdenver" || selectedDataset === "bounties") && (
                <div className="absolute bottom-6 left-6 right-6 bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Available Bounties:</h3>
                  <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
                    hover:scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    <div className="flex flex-wrap gap-2 p-1">
                      {sponsorProjects.map((project) => (
                        <button
                          key={project.name}
                          onClick={() => handleProjectClick(project)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                            "relative",
                            project.color,
                            isProjectSelected(project.name)
                              ? "ring-2 ring-offset-2 ring-current" 
                              : "hover:ring-2 hover:ring-offset-2 hover:ring-current/50"
                          )}
                        >
                          {project.name} {project.amount}
                          {isProjectSelected(project.name) && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 
                              w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Vitalik AI bubble - now shows in both ETHDenver and Bounties tabs */}
              {(selectedDataset === "ethdenver" || selectedDataset === "bounties") && 
                chatHistory[selectedDataset].length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleVitalikClick}
                  className="group absolute bottom-6 right-6 z-20"
                >
                  <style>{floatingAnimation}</style>
                  <div 
                    className={cn(
                      "relative",
                      isVitalikActive && "ring-2 ring-purple-500 ring-offset-2 rounded-full"
                    )}
                    style={{
                      animation: 'float 3s ease-in-out infinite'
                    }}
                  >
                    <img 
                      src="/vitalik-ai.png"
                      alt="Vitalik AI"
                      className={cn(
                        "w-16 h-16 rounded-full shadow-lg transition-all duration-200",
                        isVitalikActive 
                          ? "brightness-100 scale-105" 
                          : "brightness-90 hover:brightness-100 hover:scale-105"
                      )}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg
                      pointer-events-none"
                    >
                      {isVitalikActive ? "Vitalik AI is active" : "Vet w/ Vitalik AI"}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
                        border-8 border-transparent border-t-gray-800"
                      />
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Action bubbles for Vitalik AI */}
              {selectedDataset === "vitalik" && showVitalikBubbles && chatHistory[selectedDataset].length === 0 && (
                <div className="absolute bottom-[1.5rem] right-6 flex flex-col gap-1.5 w-56">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => handleVitalikBubbleClick('jam')}
                    className="bg-[#F08080] hover:bg-[#E57373] text-white py-1.5 px-3 rounded-full 
                      text-sm font-medium text-center transition-all duration-200 
                      shadow-sm hover:shadow-md"
                  >
                    Jam with Vitalik
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => handleVitalikBubbleClick('perspective')}
                    className="bg-[#F08080] hover:bg-[#E57373] text-white py-1.5 px-3 rounded-full 
                      text-sm font-medium text-center transition-all duration-200 
                      shadow-sm hover:shadow-md"
                  >
                    Get Vitalik's perspective
                  </motion.button>
                </div>
              )}

              {/* Action bubbles for REKT AI */}
              {selectedDataset === "rekt" && showRektBubbles && chatHistory[selectedDataset].length === 0 && (
                <div className="absolute bottom-[1.5rem] right-6 flex flex-col gap-1.5 w-56">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => handleRektBubbleClick('security')}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white py-1.5 px-3 rounded-full 
                      text-sm font-medium text-center transition-all duration-200 
                      shadow-sm hover:shadow-md"
                  >
                    Security Analysis
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => handleRektBubbleClick('risk')}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white py-1.5 px-3 rounded-full 
                      text-sm font-medium text-center transition-all duration-200 
                      shadow-sm hover:shadow-md"
                  >
                    Risk Assessment
                  </motion.button>
                </div>
              )}
            </div>

            <div className="input-container">
              <InputArea 
                value={input} 
                onChange={setInput} 
                onSubmit={handleSubmit}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bounty Selection Dialog */}
      {isDialogOpen && currentProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentProject.name} Bounties
              </h2>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {currentProject.bounties.map((bounty) => (
                <div 
                  key={bounty.name}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedBounties.includes(`${currentProject.name}:${bounty.name}`)}
                    onChange={() => handleBountySelect(bounty.name, currentProject.name)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{bounty.name}</h3>
                    <p className="text-sm text-gray-600">{bounty.description}</p>
                    <span className="text-sm font-medium text-blue-600">{bounty.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
