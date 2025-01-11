# Multi-Signature Bitcoin Wallet (Stacks Smart Contract + React Frontend)

![Stacks](https://img.shields.io/badge/Built%20with-Stacks-blue?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue?style=flat-square)

## 🌟 Project Overview

This project is a **Multi-Signature Bitcoin Wallet** built using:
- **Stacks Smart Contracts** (Written in Clarity)
- **React with TypeScript** (For the frontend)
- **Stacks.js** (For blockchain interactions)
- **Next.js** (For SSR and optimized performance)

### ✨ Features:
- 📌 **Connect / Disconnect Stacks Wallet**
- 🔐 **Propose Transactions** (Multi-signature approval required)
- ✅ **Approve Transactions**
- 🚀 **Execute Transactions**
- 📡 **Retrieve Past Transactions**

## 🏗 Project Structure

```plaintext
multi-sig-wallet/
│── smart_contract/          # Clarity smart contract
│   ├── contracts/           # Contains the main contract
│   ├── tests/               # Clarity tests
│   ├── Clarinet.toml        # Clarinet config file
│
│── frontend/                # TypeScript + Next.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components (Wallet, TransactionList, etc.)
│   │   ├── utils/           # Blockchain interaction logic
│   │   ├── pages/           # Next.js page structure
│   │── .env.local           # Environment variables (ignored in Git)
│   │── package.json         # Dependencies
│   │── tsconfig.json        # TypeScript config
│
│── README.md                # Documentation
│── .gitignore               # Ignore unnecessary files
│── LICENSE                  # Open-source license (MIT recommended)
