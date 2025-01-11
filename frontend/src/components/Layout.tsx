// components/Layout.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppConfig, UserSession } from "@stacks/connect";
import { ArrowLeft } from "lucide-react";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setCurrentUser(userData.profile.stxAddress.testnet);
    }
  }, []);

  const isActionPage = pathname !== "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50 p-4 flex items-center">
        {isActionPage && (
          <button onClick={() => router.push('/')} className="text-white hover:text-gray-300 transition-colors flex items-center space-x-2">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        )}
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800/30 border-t border-gray-700/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>MultiSig Wallet © 2025 - Built on Stacks</p>
        </div>
      </footer>
    </div>
  );
}
