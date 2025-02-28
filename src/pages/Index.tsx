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
  
  const bounties = [
    {
      name: "Coinbase Developer Platform",
      amount: "$20,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Most Innovative Use of AgentKit", amount: "$5,000", description: "Create innovative experiences using AgentKit with onchain apps" },
        { name: "Best Agent project using CDP Tools", amount: "$5,000", description: "Integrate CDP tooling like Onramp, Commerce, Smart Wallets" },
        { name: "Best Combination of AgentKit and OnchainKit", amount: "$5,000", description: "Build powerful experiences using AgentKit and OnchainKit" },
        { name: "Best AgentKit documentation", amount: "$2,500", description: "Improve documentation with solution guides and tutorials" },
        { name: "Best AgentKit Contributions", amount: "$2,500", description: "Contribute to open-source AgentKit repos with new features" }
      ]
    },
    {
      name: "Protocol Labs",
      amount: "$20,000", 
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "Filecoin Storage & Retrieval", amount: "$10,500", description: "Implement on-chain/cross-chain Filecoin storage" },
        { name: "Store using Akave", amount: "$4,000", description: "Store project data using Akave object storage" },
        { name: "Storacha Integration", amount: "$5,500", description: "Build applications using Storacha storage" }
      ]
    },
    {
      name: "The Graph",
      amount: "$10,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Best use of The Graph", amount: "$8,000", description: "Use Subgraph/Substream in your dapp" },
        { name: "Best Substream", amount: "$2,000", description: "Process web3 data using new/existing Substream" }
      ]
    },
    {
      name: "World",
      amount: "$20,000",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "Best Mini App", amount: "$17,500", description: "Build and deploy Mini Apps using MiniKit" },
        { name: "World Pool Prize", amount: "$2,500", description: "Build within World ecosystem" }
      ]
    },
    {
      name: "Arbitrum",
      amount: "$20,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "Stylus General Track", amount: "$7,500", description: "Build non-DeFi applications using Arbitrum Stylus" },
        { name: "DeFi on Stylus", amount: "$8,000", description: "Build DeFi applications using Stylus" }
      ]
    },
    {
      name: "Hedera",
      amount: "$8,500",
      color: "bg-indigo-100 text-indigo-600",
      bounties: [
        { name: "EVM Starter Bounty", amount: "$3,000", description: "Build using Hedera Smart Contract Service" },
        { name: "Native Services Starter", amount: "$1,500", description: "Build using HTS or HCS" },
        { name: "Ecosystem Builder", amount: "$4,000", description: "Build new value for Hedera ecosystem" }
      ]
    },
    {
      name: "Autonome",
      amount: "$20,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Best DeFAI Agent", amount: "$4,000", description: "Build best DeFi AI agent using Autonome platform" },
        { name: "Best Social Agent", amount: "$4,000", description: "Create innovative social AI agent on Autonome" },
        { name: "Most Innovative Agent", amount: "$3,000", description: "Build unique AI agent with novel use case" }
      ]
    },
    {
      name: "Nethermind",
      amount: "$20,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "Create Robotic Agent", amount: "$6,000", description: "Build AI agent with robotics/virtual integration" },
        { name: "Best AI Integration", amount: "$5,000", description: "Integrate AI with blockchain effectively" },
        { name: "Most Creative Solution", amount: "$4,000", description: "Build innovative solution using Nethermind tools" }
      ]
    },
    {
      name: "Bitkub",
      amount: "$20,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Best dApp on Bitkub Chain", amount: "$5,000", description: "Build innovative dApp on Bitkub Chain" },
        { name: "Best KUB Coin Utilization", amount: "$5,000", description: "Create solutions to boost KUB adoption" }
      ]
    },
    {
      name: "Kinto",
      amount: "$20,000",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "Best Kinto App", amount: "$7,500", description: "Build best application using Kinto platform" },
        { name: "Kinto Smart Contract APIs", amount: "$3,500", description: "Implement useful Kinto Smart Contract features" },
        { name: "Kinto Wallet SDK", amount: "$3,500", description: "Integrate Kinto Wallet in innovative ways" }
      ]
    },
    {
      name: "AWS",
      amount: "$1,000",
      color: "bg-orange-100 text-orange-600",
      bounties: [
        { name: "Best Amazon Bedrock Project", amount: "$1,000", description: "Build innovative application on Amazon Bedrock" }
      ]
    },
    {
      name: "CoopHive",
      amount: "$1,000",
      color: "bg-pink-100 text-pink-600",
      bounties: [
        { name: "Best use of CoopHive", amount: "$650", description: "Best integration of CoopHive SDK" },
        { name: "Runner Up", amount: "$350", description: "Second best CoopHive integration" }
      ]
    },
    {
      name: "Venn",
      amount: "$1,000",
      color: "bg-teal-100 text-teal-600",
      bounties: [
        { name: "Best DeFi dApp with Venn", amount: "$1,000", description: "Integrate Venn's firewall in DeFi application" }
      ]
    },
    {
      name: "Capsule",
      amount: "$1,000",
      color: "bg-indigo-100 text-indigo-600",
      bounties: [
        { name: "Best Web App with Capsule", amount: "$1,000", description: "Use Capsule Web Modal for seamless onboarding" }
      ]
    },
    {
      name: "Hyperbolic",
      amount: "$1,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "Best AI Agent", amount: "$1,000", description: "Build autonomous agent using Hyperbolic API" }
      ]
    },
    {
      name: "Crestal Network",
      amount: "$1,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Most Innovative IntentKit Usage", amount: "$500", description: "Build AI agent using IntentKit" },
        { name: "Best Technical Skill", amount: "$300", description: "Create impressive technical integration" },
        { name: "Best Web3 Integration", amount: "$200", description: "Integrate Web3 skills with agents" }
      ]
    },
    {
      name: "Kinode",
      amount: "$1,000",
      color: "bg-gray-100 text-gray-600",
      bounties: [
        { name: "Best Kinode App", amount: "$1,000", description: "Build decentralized app using Kinode platform" }
      ]
    },
    {
      name: "BOS",
      amount: "$15,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Best BOS Component", amount: "$5,000", description: "Create innovative BOS frontend components" },
        { name: "Best Integration", amount: "$5,000", description: "Integrate BOS with other protocols/chains" },
        { name: "Community Choice", amount: "$5,000", description: "Most popular BOS implementation" }
      ]
    },
    {
      name: "Scroll",
      amount: "$15,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Best Overall Project", amount: "$5,000", description: "Build innovative dApp on Scroll" },
        { name: "Best DeFi Project", amount: "$5,000", description: "Create DeFi solutions on Scroll" },
        { name: "Best NFT/Gaming Project", amount: "$5,000", description: "Develop NFT or gaming project on Scroll" }
      ]
    },
    {
      name: "Mantle",
      amount: "$15,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "Best DeFi dApp", amount: "$7,500", description: "Build DeFi application on Mantle" },
        { name: "Best Overall dApp", amount: "$7,500", description: "Create innovative solution on Mantle" }
      ]
    },
    {
      name: "Linea",
      amount: "$12,500",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "Best Overall Project", amount: "$5,000", description: "Build innovative dApp on Linea" },
        { name: "Best DeFi Project", amount: "$4,000", description: "Create DeFi solution on Linea" },
        { name: "Best Gaming Project", amount: "$3,500", description: "Develop gaming project on Linea" }
      ]
    },
    {
      name: "Polygon",
      amount: "$10,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Best Use of Polygon zkEVM", amount: "$5,000", description: "Build on Polygon zkEVM" },
        { name: "Best Use of Polygon CDK", amount: "$5,000", description: "Create app using Polygon CDK" }
      ]
    },
    {
      name: "Fuel",
      amount: "$10,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "Best Overall Project", amount: "$5,000", description: "Build innovative solution on Fuel" },
        { name: "Best DeFi dApp", amount: "$5,000", description: "Create DeFi application on Fuel" }
      ]
    }
  ];

  const sponsorProjects: SponsorProject[] = [
    {
      name: "ETHDenver 2025",
      amount: "$80,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "DEFI, NFTS + Gaming", amount: "$15,000", description: "Build DeFi 2.0, DEXs, NFTs, blockchain games and more" },
        { name: "INFRASTRUCTURE + SCALABILITY", amount: "$15,000", description: "Build L1, L2, side chains, POA networks, dev tools" },
        { name: "IDENTITY, PRIVACY + SECURITY", amount: "$15,000", description: "Create wallets, ZK rollups, privacy solutions, security tools" },
        { name: "IMPACT + PUBLIC GOODS", amount: "$15,000", description: "Build solutions for SDGs, public goods, ReFi" },
        { name: "DAOS + COMMUNITIES", amount: "$15,000", description: "Create DAOs, digital communities, governance solutions" },
        { name: "Celebrity Track Winner", amount: "$5,000", description: "Special prize awarded by celebrity judges during final ceremony" }
       ]
    },
    {
      name: "Polkadot",
      amount: "$10,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "AppChain App Development", amount: "$2,500", description: "Build new AppChain apps and libraries for Polkadot" },
        { name: "DAO Development", amount: "$2,500", description: "Create novel UI/UX for governance using Polkadot SDK" },
        { name: "Autonomous Development", amount: "$2,500", description: "Build self-sustainable autonomous projects on Polkadot" },
        { name: "Cross-Chain Development", amount: "$2,500", description: "Create cross-chain interactions using bridges and XCM" }
      ]
    },
    {
      name: "EigenLayer",
      amount: "$50,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Best EigenLayer AVS", amount: "$20,000", description: "Create the best new EigenLayer AVS" },
        { name: "Best AI Application", amount: "$20,000", description: "Build AI app leveraging EigenLayer or AVS" },
        { name: "Best Eigen App", amount: "$10,000", description: "Build app using EigenLayer AVS or EigenDA rollup" }
      ]
    },
    {
      name: "Story",
      amount: "$20,000", 
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "AI Agents", amount: "$10,000", description: "Add Story plugin to AI Agent with IP tracking and licensing" },
        { name: "DApp Integration", amount: "$5,000", description: "Add IP tracking and licensing to any DApp" },
        { name: "IPFi", amount: "$5,000", description: "Build DeFi primitives for IP liquidity and trading" }
      ]
    },
    {
      name: "zircuit",
      amount: "$18,000",
      color: "bg-indigo-100 text-indigo-600", 
      bounties: [
        { name: "Best Project", amount: "$8,000", description: "Build best overall project on Zircuit" },
        { name: "Best DeFAI Project", amount: "$5,000", description: "Create DeFi + AI integration on Zircuit" },
        { name: "Best Telegram Mini-app", amount: "$5,000", description: "Build engaging Telegram mini-app on Zircuit" }
      ]
    },
    {
      name: "okto",
      amount: "$25,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "Consumer DApps", amount: "$10,000", description: "Build user-facing dApp with exceptional UX" },
        { name: "HyperLiquid x Okto DeFi", amount: "$10,000", description: "Create innovative DeFi on HyperEVM with Okto SDK" },
        { name: "AI Agent", amount: "$5,000", description: "Develop AI agent using Okto SDK for on-chain ops" }
      ]
    },
    {
      name: "Optimism",
      amount: "$40,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "AI Agent Token Trader", amount: "$5,000", description: "Build AI trading bot for Superchain tokens" },
        { name: "SwapSmart", amount: "$5,000", description: "Create Superchain token swapping product" },
        { name: "Multi-chain Attestations", amount: "$5,000", description: "Build cross-chain credential system" },
        { name: "Superchain Wallet", amount: "$5,000", description: "Create user-friendly multi-chain wallet" },
        { name: "AI dApp Builder", amount: "$5,000", description: "Build AI agent for creating interoperable dApps" },
        { name: "Superchain Flash Loan", amount: "$5,000", description: "Develop cross-chain flash loan protocol" },
        { name: "CrossPredict", amount: "$5,000", description: "Create cross-chain prediction markets" },
        { name: "Lending Protocol", amount: "$5,000", description: "Build Superchain lending/borrowing platform" }
      ]
    },
    {
      name: "Flow",
      amount: "$50,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Most Killer App", amount: "$15,000", description: "Build consumer app solving real user problems" },
        { name: "Best AI Agents", amount: "$15,000", description: "Create innovative AI agents on Flow" },
        { name: "Best ReFi", amount: "$12,000", description: "Build sustainable finance solutions" },
        { name: "Best Eliza Plugins", amount: "$5,000", description: "Create plugins extending Eliza on Flow" },
        { name: "Best Opensource", amount: "$2,000", description: "Contribute to Flow ecosystem projects" },
        { name: "Best Feedback", amount: "$1,000", description: "Provide valuable developer experience insights" }
      ]
    },
    {
      name: "Gravity by Galxe",
      amount: "$22,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "CLOB-based DEX", amount: "$8,000", description: "Build first CLOB DEX on Gravity Chain" },
        { name: "Crypto Agent Evaluation", amount: "$4,000", description: "Create framework to evaluate crypto-focused agents" },
        { name: "EVM Arena", amount: "$4,000", description: "Build benchmarking tool for EVM chains" },
        { name: "Incentive Mechanisms", amount: "$3,000", description: "Design mechanisms for parallel EVM chains" },
        { name: "Meme Token Alert", amount: "$3,000", description: "Create real-time alert system for tokens" }
      ]
    },
    {
      name: "Coinbase Developer Platform",
      amount: "$20,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "AgentKit Innovation", amount: "$8,000", description: "Create innovative agent using AgentKit" },
        { name: "CDP SDK Integration", amount: "$3,000", description: "Build unique experiences with CDP SDK" },
        { name: "CDP Regen Prize", amount: "$3,000", description: "Create positive social/environmental impact" },
        { name: "Onramp & Stablecoins", amount: "$3,000", description: "Build app using Onramp and USDC" },
        { name: "Consumer Crypto", amount: "$2,000", description: "Create consumer-focused crypto app" },
        { name: "Developer Feedback", amount: "$1,000", description: "Provide valuable SDK feedback and improvements" }
      ]
    },
    {
      name: "Internet Computer",
      amount: "$39,000",
      color: "bg-gray-100 text-gray-600",
      bounties: [
        { name: "Only on ICP", amount: "$13,000", description: "Build unique app leveraging ICP features" },
        { name: "vetKeys Integration", amount: "$13,000", description: "Create app using on-chain encryption" },
        { name: "AI Agent Framework", amount: "$13,000", description: "Build agent or plugin using ICP capabilities" }
      ]
    },
    {
      name: "Humanity Protocol",
      amount: "$21,000",
      color: "bg-pink-100 text-pink-600",
      bounties: [
        { name: "Web Credentials", amount: "$16,000", description: "Build verifiable credentials web app" },
        { name: "Mobile Credentials", amount: "$5,000", description: "Create mobile app for credential management" }
      ]
    },
    {
      name: "Silo Finance",
      amount: "$15,000",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "Best Hook Design", amount: "$15,000", description: "Create custom hook for Silo lending market" }
      ]
    },
    {
      name: "Base",
      amount: "$50,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "AI-powered Apps", amount: "$25,000", description: "Build AI agents using Coinbase AgentKit" },
        { name: "Farcaster MiniApp", amount: "$25,000", description: "Create engaging MiniApp using Farcaster Frames" }
      ]
    },
    {
      name: "ora",
      amount: "$3,333",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "ORA Integration", amount: "$3,333", description: "Use ORA's API for verifiable AI inference" }
      ]
    },
    {
      name: "NoFeeSwap",
      amount: "$100,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "Security Bug Bounty", amount: "$100,000", description: "Find bugs in pre-launch DEX smart contracts" }
      ]
    },
    {
      name: "Uniswap",
      amount: "$15,000",
      color: "bg-pink-100 text-pink-600",
      bounties: [
        { name: "V4 Innovation", amount: "$7,500", description: "Build projects on Uniswap v4 on Unichain" },
        { name: "DeFi Innovation", amount: "$7,500", description: "Create DeFi projects on Unichain" }
      ]
    },
    {
      name: "Decent",
      amount: "$3,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "DAO Integration", amount: "$3,000", description: "Deploy protocol with DAO ownership" }
      ]
    },
    {
      name: "Taraxa",
      amount: "$20,000",
      color: "bg-indigo-100 text-indigo-600",
      bounties: [
        { name: "Memecoin Generator", amount: "$5,000", description: "Build automated memecoin creator with social data" },
        { name: "Community Persona", amount: "$5,000", description: "Create AI-driven community tool using TrendMoon" },
        { name: "Eliza Plugin", amount: "$5,000", description: "Build plugin integrating TrendMoon data" },
        { name: "Network Dashboard", amount: "$2,500", description: "Create realtime Taraxa L1 dashboard" },
        { name: "L2 Integration", amount: "$2,500", description: "Build dApp using Taraxa as Ethereum L2" }
      ]
    },
    {
      name: "zkSync",
      amount: "$25,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Best Web3 Onboarding UX", amount: "$9,000", description: "Build with ZKSync SSO SDK for Web2-like UX" },
        { name: "AI Agent on ZKsync Era", amount: "$7,000", description: "Launch AI agent for onchain actions on ZKsync" },
        { name: "Best Consumer App", amount: "$5,000", description: "Build next-gen products on ZKsync" },
        { name: "ZK is the Endgame", amount: "$4,000", description: "Build ZK apps on ZKsync Era" }
      ]
    },
    {
      name: "Wire Network",
      amount: "$15,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Gaming", amount: "$5,000", description: "Integrate Wire Network into gaming experiences" },
        { name: "AI Agents", amount: "$5,000", description: "Develop intelligent systems using blockchain" },
        { name: "MutAgent", amount: "$5,000", description: "Create evolving AI characters with blockchain records" }
      ]
    },
    {
      name: "ink",
      amount: "$8,000",
      color: "bg-indigo-100 text-indigo-600",
      bounties: [
        { name: "SocialFi & GambleFi", amount: "$3,000", description: "Combine SocialFi, GambleFi and DeFi on Ink" },
        { name: "Mobile Web App", amount: "$2,500", description: "Build lightweight mobile app for payments" },
        { name: "Account Abstraction", amount: "$2,500", description: "Use ZeroDev toolkit for improved DeFi UX" }
      ]
    },
    {
      name: "Somnia Network",
      amount: "$15,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "Mass Consumer dApp", amount: "$10,000", description: "Build high-performance dApp for millions" },
        { name: "Somnia Innovation", amount: "$5,000", description: "Create unique app using Somnia capabilities" }
      ]
    },
    {
      name: "Wormhole Network",
      amount: "$22,000",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "Multichain DeFi NTT", amount: "$10,000", description: "Build using Native Token Transfers" },
        { name: "Typescript SDK", amount: "$6,000", description: "Build using Wormhole Typescript SDK" },
        { name: "Wormhole Queries", amount: "$6,000", description: "Build apps using cross-chain data queries" }
      ]
    },
    {
      name: "Olas",
      amount: "$25,000",
      color: "bg-pink-100 text-pink-600",
      bounties: [
        { name: "Agent Integration", amount: "$12,000", description: "Integrate agents using Olas SDK" },
        { name: "Mech Supply Side", amount: "$8,000", description: "Design and publish new Mech tools" },
        { name: "Mech Demand Side", amount: "$5,000", description: "Use existing Mechs in applications" }
      ]
    },
    {
      name: "Acronym Foundation",
      amount: "$5,000",
      color: "bg-gray-100 text-gray-600",
      bounties: [
        { name: "Anvil Contract Spec", amount: "$2,500", description: "Design new collateralizable contract idea" },
        { name: "LOC Liquidator", amount: "$2,500", description: "Build smart contract for LOC liquidations" }
      ]
    },
    {
      name: "Ammalgam",
      amount: "$8,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "DeFi Renaissance", amount: "$8,000", description: "Build best Ammalgam vault or innovative DeFi" }
      ]
    },
    {
      name: "Euler Labs",
      amount: "$5,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Euler AI Integration", amount: "$5,000", description: "Build AI agent for Euler lending protocol" }
      ]
    },
    {
      name: "U2U Network",
      amount: "$25,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "DePIN Projects", amount: "$13,000", description: "Build DePIN projects using U2U DePIN Subnet" },
        { name: "NFTFi Products", amount: "$3,000", description: "Create innovative NFTFi products" },
        { name: "Next Gen SocialFi", amount: "$3,000", description: "Build social apps using Ermis" },
        { name: "Onchain Gaming", amount: "$3,000", description: "Build games with LayerG and U2U" },
        { name: "RWA Products", amount: "$3,000", description: "Create RWA solutions on U2U Network" }
      ]
    },
    {
      name: "Kite AI",
      amount: "$3,000",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "DeFi AI Agent", amount: "$3,000", description: "Build AI agent for DeFi challenges" }
      ]
    },
    {
      name: "Divvi",
      amount: "$10,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "NextGen DeFi UX", amount: "$10,000", description: "Build mobile DeFi app for new users" }
      ]
    },
    {
      name: "zkVerify Foundation",
      amount: "$25,000",
      color: "bg-indigo-100 text-indigo-600",
      bounties: [
        { name: "ZK Proofs Innovation", amount: "$25,000", description: "Build apps using advanced ZK Proofs on zkVerify" }
      ]
    },
    {
      name: "Hacken",
      amount: "$14,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "AI Smart Contract Auditor", amount: "$10,000", description: "Build AI agent for smart contract auditing" },
        { name: "Hack a Blockchain", amount: "$3,000", description: "Find vulnerabilities in Polkadot & Parity" },
        { name: "Depeg Monitor", amount: "$1,000", description: "Build token price deviation detector" }
      ]
    },
    {
      name: "Midnight Network",
      amount: "$25,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "Social dApp Privacy", amount: "$5,000", description: "Create privacy features for social apps" },
        { name: "First Meme Token", amount: "$5,000", description: "Launch first meme token on Midnight testnet" },
        { name: "Token Standard Port", amount: "$5,000", description: "Port Ethereum token standard to Midnight" },
        { name: "Data Game", amount: "$5,000", description: "Build game using data protection features" },
        { name: "ZK Integration", amount: "$5,000", description: "Add Midnight ZK proofs to your app" }
      ]
    },
    {
      name: "Quantum Resistant Ledger",
      amount: "$10,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "QRL Zond Challenge", amount: "$10,000", description: "Build dApps on post-quantum secure blockchain" }
      ]
    },
    {
      name: "Arweave",
      amount: "$25,000",
      color: "bg-yellow-100 text-yellow-600",
      bounties: [
        { name: "Fair-Launched Projects", amount: "$6,000", description: "Build fair-launched projects on AO" },
        { name: "Autonomous DeFi", amount: "$6,000", description: "Create autonomous DeFi tools on AO" },
        { name: "Mobile Gaming", amount: "$5,000", description: "Build mobile games with ArConnect" },
        { name: "Tax Automation", amount: "$4,000", description: "Create crypto tax reporting solution" },
        { name: "ArNS Integration", amount: "$4,000", description: "Build apps using Arweave Name System" }
      ]
    },
    {
      name: "BNB Chain",
      amount: "$25,000",
      color: "bg-pink-100 text-pink-600",
      bounties: [
        { name: "Verifiable Computing", amount: "$25,000", description: "Build solution bridging off-chain computation" }
      ]
    },
    {
      name: "EthStorage",
      amount: "$20,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "AI Agent Using QuarkChain", amount: "$5,000", description: "Build AI agent using QuarkChain SWC L2" },
        { name: "Decentralized Social", amount: "$5,000", description: "Build social network with Web3:// and EthStorage" },
        { name: "Content Management", amount: "$5,000", description: "Build CMS using Web3:// and EthStorage" },
        { name: "On-chain Gaming", amount: "$5,000", description: "Create games using Web3:// and EthStorage" }
      ]
    },
    {
      name: "Sui | Walrus",
      amount: "$12,000",
      color: "bg-indigo-100 text-indigo-600",
      bounties: [
        { name: "Walrus Tusked Champion", amount: "$6,000", description: "Build MVP using Walrus storage system" },
        { name: "Best Use of Sui", amount: "$6,000", description: "Create prototype leveraging Sui capabilities" }
      ]
    },
    {
      name: "Ripple",
      amount: "$10,000",
      color: "bg-green-100 text-green-600",
      bounties: [
        { name: "RLUSD Adoption", amount: "$10,000", description: "Launch MVP using RLUSD stablecoin" }
      ]
    },
    {
      name: "Quai Network",
      amount: "$25,000",
      color: "bg-red-100 text-red-600",
      bounties: [
        { name: "DeFi Lending Markets", amount: "$5,000", description: "Create lending markets on Quai Network" },
        { name: "Wallet Connectivity", amount: "$5,000", description: "Build universal wallet connection protocols" },
        { name: "Payment Solutions", amount: "$5,000", description: "Create global payment solutions on Quai" },
        { name: "AI Agent Framework", amount: "$5,000", description: "Develop AI agents using ZerePy framework" },
        { name: "Custody Solutions", amount: "$5,000", description: "Build enterprise-grade custody solutions" }
      ]
    },
    {
      name: "theoriq",
      amount: "$15,000",
      color: "bg-purple-100 text-purple-600",
      bounties: [
        { name: "AlphaSwarm", amount: "$15,000", description: "Build AI agents for on-chain DeFi actions" }
      ]
    },
    {
      name: "Chainlink",
      amount: "$15,000",
      color: "bg-blue-100 text-blue-600",
      bounties: [
        { name: "Best use of CCIP", amount: "$9,000", description: "Build apps using Chainlink CCIP" },
        { name: "Connect the World", amount: "$6,000", description: "Build using any Chainlink service" }
      ]
    }
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
            <div className="flex-1 bg-white rounded-xl p-6 shadow-sm mb-4 lg:min-h-[75vh] min-h-[70vh] relative">
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
                      {(selectedDataset === "ethdenver" ? sponsorProjects : bounties).map((project) => (

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
