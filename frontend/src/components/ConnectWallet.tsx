// components/ConnectWallet.tsx
"use client";
import { useState, useEffect } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { LogOut } from "lucide-react";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

interface ConnectWalletProps {
  onConnect: (walletAddress: string | null) => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect }) => {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUser(userData);
      onConnect(userData.profile.stxAddress.testnet);
    }
  }, [onConnect]);

  const connectWallet = async () => {
    try {
      await showConnect({
        appDetails: {
          name: "Multi-Sig Wallet",
          icon: window.location.origin + "/favicon.ico",
        },
        onFinish: () => {
          const userData = userSession.loadUserData();
          setUser(userData);
          onConnect(userData.profile.stxAddress.testnet);
        },
        userSession,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUser(null);
    onConnect(null);
    setIsDropdownOpen(false);
  };

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
    setDropdownTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (user) {
    return (
      <div 
        className="relative inline-block"
        onMouseLeave={handleMouseLeave}
      >
        <div 
          onMouseEnter={handleMouseEnter}
          className="bg-gray-800/70 backdrop-blur-sm rounded-full px-6 py-3 
                   border border-gray-700 hover:border-gray-600 
                   transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="flex flex-col">
              <span className="text-gray-300 text-sm">
                {formatAddress(user.profile.stxAddress.testnet)}
              </span>
              {user.profile.btcAddress?.p2wpkh?.testnet && (
                <span className="text-gray-400 text-xs">
                  BTC: {formatAddress(user.profile.btcAddress.p2wpkh.testnet)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isDropdownOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 transform-gpu z-50"
            style={{ minWidth: '100%' }}
          >
            <button
              onClick={disconnectWallet}
              onMouseEnter={handleMouseEnter}
              className="w-full flex items-center justify-center space-x-2
                       py-2 px-4 bg-red-500/10 text-red-400 
                       rounded-lg border border-red-500/20
                       hover:bg-red-500/20 transition-all duration-300"
            >
              <LogOut size={16} />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
               py-3 px-8 rounded-full transition-all duration-300
               shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
               active:translate-y-0 active:shadow-lg"
    >
      Connect Wallet
    </button>
  );
};

export default ConnectWallet;