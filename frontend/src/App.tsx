import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Command, Wallet, DollarSign, ChevronDown } from 'lucide-react';
import { FaEthereum, FaArrowDown, FaShieldAlt, FaMicrochip, FaDiscord, FaChevronDown, } from 'react-icons/fa';

const VAULT_ADDRESS = '0xdfA8A83B0941F1d3ec47AD3BfEAE9D929E29b915';
const YBTC_ADDRESS = '0xBBd3EDd4D3b519c0d14965d9311185CFaC8c3220';
const YU_ADDRESS = '0xcB856bC5Aa2664E47c9caDce6fF65117c5201a1C';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const VAULT_ABI = [
  "function depositYBTC(uint256 _amount) external",
  "function depositYU(uint256 _amount) external",
  "function withdrawYBTC(uint256 _amount) external",
  "function withdrawYU(uint256 _amount) external"
];

function App() {
  // ... [Previous state declarations remain the same]
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [depositToken, setDepositToken] = useState('YBTC');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawToken, setWithdrawToken] = useState('YBTC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  // ... [All your previous functions remain exactly the same]
  async function connectWallet() {
    if (!(window as any).ethereum) {
      setStatus('MetaMask not found. Install it first.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setStatus('Connected!');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      setStatus('Connect wallet first.');
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) {
      setStatus('Deposit amount must be > 0');
      return;
    }

    try {
      setStatus('Starting deposit...');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const tokenAddress = (depositToken === 'YBTC') ? YBTC_ADDRESS : YU_ADDRESS;
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

      const decimals = 18;
      const amountWei = ethers.parseUnits(depositAmount, decimals);

      setStatus(`Approving vault to spend ${depositAmount} ${depositToken}...`);
      const approveTx = await tokenContract.approve(VAULT_ADDRESS, amountWei);
      await approveTx.wait();

      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
      if (depositToken === 'YBTC') {
        setStatus(`Calling depositYBTC(${depositAmount})...`);
        const tx = await vaultContract.depositYBTC(amountWei);
        await tx.wait();
      } else {
        setStatus(`Calling depositYU(${depositAmount})...`);
        const tx = await vaultContract.depositYU(amountWei);
        await tx.wait();
      }

      setStatus(`Deposit successful!`);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      setStatus('Connect wallet first.');
      return;
    }
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setStatus('Withdraw amount must be > 0');
      return;
    }

    try {
      setStatus('Starting withdraw...');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

      const decimals = 18;
      const amountWei = ethers.parseUnits(withdrawAmount, decimals);

      if (withdrawToken === 'YBTC') {
        setStatus(`Calling withdrawYBTC(${withdrawAmount})...`);
        const tx = await vaultContract.withdrawYBTC(amountWei);
        await tx.wait();
      } else {
        setStatus(`Calling withdrawYU(${withdrawAmount})...`);
        const tx = await vaultContract.withdrawYU(amountWei);
        await tx.wait();
      }

      setStatus('Withdraw successful!');
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-black font-inter relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0">
        {/* <div className="absolute inset-0 bg-[radial-gradient(circle,#00ff9580_1px,transparent_1px)] bg-[length:32px_32px] opacity-20"></div> */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2fe20,#4facfe20)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4facfe10_0%,transparent_50%)] animate-pulse"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <nav className="relative bg-black/40 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaEthereum className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-3xl font-bold font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            Oasis
            </span>
          </div>
          <button
            onClick={connectWallet}
            className="flex items-center space-x-2 bg-cyan-900/20 text-cyan-400 px-6 py-2 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-300 group shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]"
          >
            <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">
              {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </span>
          </button>
        </div>
      </nav>

      <div className="relative bg-black/40 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            AI-Powered Crypto Trading
          </h1>
          <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
            Trade cryptocurrencies using natural language commands through Discord.
            Secure, automated, and powered by advanced AI.
          </p>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {status && (
          <div className="mb-8 p-4 bg-black/40 rounded-lg border border-cyan-500/20 backdrop-blur-md">
            <p className="text-cyan-100">{status}</p>
          </div>
        )}

<div className="grid md:grid-cols-2 gap-8 mb-16">
  {/* Deposit Card */}
  <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-8 hover:border-cyan-400/40 transition-all duration-300 group relative overflow-hidden">
    {/* Animated corner accents */}
    <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50 -translate-x-1/2 -translate-y-1/2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
    <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50 translate-x-1/2 translate-y-1/2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
    
    {/* Glowing background effect */}
    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyan-500/20 to-transparent"></div>
    
    <div className="relative">
      <div className="flex items-center space-x-3 mb-8">
        <FaArrowDown className="w-8 h-8 text-cyan-400 animate-bounce" />
        <h2 className="text-3xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Deposit
        </h2>
      </div>
      
      {/* Enhanced Deposit Form */}
<form onSubmit={handleDeposit} className="space-y-8">
  {/* Token Selection */}
  <div className="relative">
    <label className="block text-sm font-medium text-cyan-100 mb-3 font-audiowide flex items-center space-x-2">
      <Wallet className="w-4 h-4 text-cyan-400" />
      <span>Select Token</span>
    </label>
    <div className="relative">
      <div 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative cursor-pointer group"
      >
        <div className="w-full px-4 py-3 bg-black/80 backdrop-blur-xl border-2 border-cyan-500/20 rounded-lg text-cyan-100 flex items-center justify-between hover:border-cyan-400/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <span className="font-medium">{depositToken}</span>
          <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {/* Highlight border effect */}
        <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/0 group-hover:border-cyan-400/20 transition-colors pointer-events-none"></div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-cyan-500/5 rounded-lg blur-sm transition-opacity opacity-0 group-hover:opacity-100"></div>
      </div>

      {/* Enhanced Dropdown */}
      {isDropdownOpen && (
        <div className="absolute w-full mt-2 bg-black/90 backdrop-blur-xl rounded-lg border-2 border-cyan-500/30 overflow-hidden z-50 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          {['YBTC', 'YU'].map((token) => (
            <div
              key={token}
              onClick={() => {
                setDepositToken(token);
                setIsDropdownOpen(false);
              }}
              className="px-4 py-3 cursor-pointer hover:bg-cyan-500/10 text-cyan-100 transition-colors relative group/option"
            >
              <span className="relative z-10 font-medium">{token}</span>
              
              {/* Hover highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 transform translate-x-[-100%] group-hover/option:translate-x-[100%] transition-transform duration-700"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  {/* Amount Input */}
  <div className="relative group/input">
    <label className="block text-sm font-medium text-cyan-100 mb-3 font-audiowide flex items-center space-x-2">
      <DollarSign className="w-4 h-4 text-cyan-400" />
      <span>Amount</span>
    </label>
    <div className="relative">
      <input
        type="number"
        step="any"
        value={depositAmount}
        onChange={e => setDepositAmount(e.target.value)}
        className="w-full px-4 py-3 bg-black/80 backdrop-blur-xl border-2 border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-500/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        placeholder="Enter deposit amount..."
      />
      
      {/* Highlight border effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/0 group-hover/input:border-cyan-400/20 transition-colors pointer-events-none"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-cyan-500/5 rounded-lg blur-sm transition-opacity opacity-0 group-hover/input:opacity-100"></div>
    </div>
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="w-full bg-cyan-950/50 text-cyan-400 py-4 px-6 rounded-lg border-2 border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] relative overflow-hidden group/button"
  >
    <span className="relative z-10 font-audiowide tracking-wider flex items-center justify-center space-x-2">
      <span>Deposit Funds</span>
    </span>
    
    {/* Button highlight effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 transform translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000"></div>
    
    {/* Button glow effect */}
    <div className="absolute inset-0 -z-10 bg-cyan-500/5 rounded-lg blur-md transition-opacity opacity-0 group-hover/button:opacity-100"></div>
  </button>
</form>
    </div>
  </div>

  <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-8 hover:border-cyan-400/40 transition-all duration-300 group relative overflow-hidden">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50 -translate-x-1/2 -translate-y-1/2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50 translate-x-1/2 translate-y-1/2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
      
      {/* Glowing background effect */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyan-500/20 to-transparent"></div>
      
      <div className="relative">
        <div className="flex items-center space-x-3 mb-8">
          <FaArrowDown className="w-8 h-8 text-cyan-400 animate-bounce" />
          <h2 className="text-3xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Withdraw
          </h2>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-8">
      {/* Token Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-cyan-100 mb-3 font-audiowide flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-cyan-400" />
          <span>Select Token</span>
        </label>
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative cursor-pointer group"
          >
            <div className="w-full px-4 py-3 bg-black/80 backdrop-blur-xl border-2 border-cyan-500/20 rounded-lg text-cyan-100 flex items-center justify-between hover:border-cyan-400/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <span className="font-medium">{withdrawToken}</span>
              <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Highlight border effect */}
            <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/0 group-hover:border-cyan-400/20 transition-colors pointer-events-none"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 bg-cyan-500/5 rounded-lg blur-sm transition-opacity opacity-0 group-hover:opacity-100"></div>
          </div>

          {/* Enhanced Dropdown */}
          {isDropdownOpen && (
            <div className="absolute w-full mt-2 bg-black/90 backdrop-blur-xl rounded-lg border-2 border-cyan-500/30 overflow-hidden z-50 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              {['YBTC', 'YU'].map((token) => (
                <div
                  key={token}
                  onClick={() => {
                    setWithdrawToken(token);
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-cyan-500/10 text-cyan-100 transition-colors relative group/option"
                >
                  <span className="relative z-10 font-medium">{token}</span>
                  
                  {/* Hover highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 transform translate-x-[-100%] group-hover/option:translate-x-[100%] transition-transform duration-700"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative group/input">
        <label className="block text-sm font-medium text-cyan-100 mb-3 font-audiowide flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span>Amount</span>
        </label>
        <div className="relative">
          <input
            type="number"
            step="any"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            className="w-full px-4 py-3 bg-black/80 backdrop-blur-xl border-2 border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-500/30 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            placeholder="Enter withdrawal amount..."
          />
          
          {/* Highlight border effect */}
          <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/0 group-hover/input:border-cyan-400/20 transition-colors pointer-events-none"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 bg-cyan-500/5 rounded-lg blur-sm transition-opacity opacity-0 group-hover/input:opacity-100"></div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-cyan-950/50 text-cyan-400 py-4 px-6 rounded-lg border-2 border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] relative overflow-hidden group/button"
      >
        <span className="relative z-10 font-audiowide tracking-wider flex items-center justify-center space-x-2">
          <span>Withdraw Funds</span>
        </span>
        
        {/* Button highlight effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 transform translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000"></div>
        
        {/* Button glow effect */}
        <div className="absolute inset-0 -z-10 bg-cyan-500/5 rounded-lg blur-md transition-opacity opacity-0 group-hover/button:opacity-100"></div>
      </button>
    </form>
      </div>
    </div>
  </div>
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-black/40 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/40 transition-all duration-300 group shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]">
            <div className="flex items-center space-x-2 mb-4">
              <FaDiscord className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <h3 className="text-lg font-audiowide text-white">Natural Language</h3>
            </div>
            <p className="text-cyan-100/80">
              Trade using simple commands like "swap 5 ETH for USDC" through Discord
            </p>
          </div>

          <div className="bg-black/40 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/40 transition-all duration-300 group shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]">
            <div className="flex items-center space-x-2 mb-4">
              <FaMicrochip className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <h3 className="text-lg font-audiowide text-white">AI Powered</h3>
            </div>
            <p className="text-cyan-100/80">
              Advanced AI processes your commands and executes trades automatically
            </p>
          </div>

          <div className="bg-black/40 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-md hover:border-cyan-400/40 transition-all duration-300 group shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]">
            <div className="flex items-center space-x-2 mb-4">
              <FaShieldAlt className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <h3 className="text-lg font-audiowide text-white">Secure Vault</h3>
            </div>
            <p className="text-cyan-100/80">
              Your funds are secured by smart contracts with strict access controls
            </p>
          </div>
        </div>

        <div className="mb-16">
  <h2 className="text-3xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-12 text-center">
    How It Works
  </h2>
  
  <div className="grid md:grid-cols-3 gap-8">
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 relative z-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border-2 border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
            <span className="text-cyan-400 text-xl font-audiowide">01</span>
          </div>
          <h3 className="text-xl font-audiowide text-white">Connect</h3>
        </div>
        <p className="text-cyan-100/80 leading-relaxed">
          Link your wallet securely to access the IntentSwap AI platform. Our smart contract ensures your assets remain under your control.
        </p>
      </div>
    </div>

    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 relative z-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border-2 border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
            <span className="text-cyan-400 text-xl font-audiowide">02</span>
          </div>
          <h3 className="text-xl font-audiowide text-white">Command</h3>
        </div>
        <p className="text-cyan-100/80 leading-relaxed">
          Use natural language commands in Discord to execute trades. Simply type what you want to do, and our AI understands your intent.
        </p>
      </div>
    </div>

    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 relative z-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border-2 border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
            <span className="text-cyan-400 text-xl font-audiowide">03</span>
          </div>
          <h3 className="text-xl font-audiowide text-white">Trade</h3>
        </div>
        <p className="text-cyan-100/80 leading-relaxed">
          Our AI executes your trades with optimal routing and timing. Monitor your transactions in real-time with full transparency.
        </p>
      </div>
    </div>
  </div>
</div>

{/* New Stats Section */}
<div className="mb-16 grid md:grid-cols-4 gap-8">
  <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 text-center group hover:border-cyan-400/40 transition-all duration-300">
    <div className="text-3xl font-audiowide text-cyan-400 mb-2 group-hover:scale-110 transition-transform">$10M+</div>
    <div className="text-cyan-100/80">Total Volume</div>
  </div>
  
  <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 text-center group hover:border-cyan-400/40 transition-all duration-300">
    <div className="text-3xl font-audiowide text-cyan-400 mb-2 group-hover:scale-110 transition-transform">5K+</div>
    <div className="text-cyan-100/80">Active Users</div>
  </div>
  
  <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 text-center group hover:border-cyan-400/40 transition-all duration-300">
    <div className="text-3xl font-audiowide text-cyan-400 mb-2 group-hover:scale-110 transition-transform">50K+</div>
    <div className="text-cyan-100/80">Trades Executed</div>
  </div>
  
  <div className="bg-black/40 rounded-xl border border-cyan-500/20 backdrop-blur-md p-6 text-center group hover:border-cyan-400/40 transition-all duration-300">
    <div className="text-3xl font-audiowide text-cyan-400 mb-2 group-hover:scale-110 transition-transform">99.9%</div>
    <div className="text-cyan-100/80">Success Rate</div>
  </div>
</div>

      {/* Footer */}
      <footer className="relative bg-black/40 border-t border-cyan-500/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-cyan-100/60">
            IntentSwap AI © 2025 | Powered by OpenAI & Uniswap V2
          </p>
        </div>
      </footer>
    </div>
  </div>
  );
}

export default App;