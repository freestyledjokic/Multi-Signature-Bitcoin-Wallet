"use client";
import { useState } from "react";
import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
    const [wallet, setWallet] = useState<string | null>(null);

    return (
        <div className="home-container">
            <div className="flex-grow container mx-auto px-4 py-12 text-center">
                <h1 className="home-header">
                    Multi-Signature Bitcoin Wallet
                </h1>
                
                {!wallet && (
                    <h2 className="home-subtext">
                        Secure your Bitcoin transactions with multiple signatures!
                    </h2>
                )}

                <ConnectWallet onConnect={setWallet} />

                {wallet && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-medium text-gray-300 mb-8">Dashboard</h2>
                        <div className="home-dashboard">
                            <ActionCard 
                                href="/transactions" 
                                title="View Transactions"
                                description="See all proposed transactions"
                            />
                            <ActionCard 
                                href="/transactions/propose" 
                                title="Propose a Transaction"
                                description="Create a new transaction proposal"
                            />
                            <ActionCard 
                                href="/transactions/approve" 
                                title="Approve Transactions"
                                description="Review and approve pending transactions"
                            />
                            <ActionCard 
                                href="/transactions/execute" 
                                title="Execute Transactions"
                                description="Execute approved transactions"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionCard({ href, title, description }: { 
    href: string; 
    title: string;
    description: string;
}) {
    return (
        <a 
            href={href} 
            className="home-action-card"
        >
            <div className="text-left">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </a>
    );
}
