# 🗳️ Zero-Knowledge Based Voting DApp

A **decentralized voting application** built with **zkSNARKs (Circom)** and **Solidity**, enabling **transparent, anonymous, and secure** on-chain polling.  
Users can create or participate in polls with options for **public/private visibility** and **standard/anonymous voting modes**, ensuring privacy without sacrificing trust.

---

## 📸 Application Screenshots

Here are some key screenshots from the Voting DApp:

![Home Page](./screenshots/home.png)  
*Home Page*

![All Poll](./screenshots/allPoll.png)  
*Public Poll Listing*

![Join Poll](./screenshots/joinPoll.png)  
*Join Poll*

![Create Poll](./screenshots/createPoll.png)  
*Create Poll*

---

## 🚀 Features

- ✅ **Create & Vote in Polls** — Anyone can create or participate in polls on-chain.
- 🔒 **Public & Private Polls** — Control who can view and vote.
- 🕵️ **Standard & Anonymous Modes** —  
  - *Standard*: Votes are linked to wallet addresses.  
  - *Anonymous*: Uses **zkSNARK proofs** to ensure voter privacy.
- ⏰ **Timed Voting** — Each poll has a start and end time.
- 🌐 **Decentralized & Transparent** — Built on **Ethereum/zkSync** for immutable results.
- 🧠 **Zero-Knowledge Proof Integration** — Uses **Circom** and **snarkjs** for proof generation and verification.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Smart Contracts** | Solidity, zkSync / Ethereum |
| **Zero-Knowledge Proofs** | Circom, snarkjs |
| **Frontend** | React (Vite), TailwindCSS |
| **Blockchain Interaction** | ethers.js, web3.js |
| **Backend (if applicable)** | Node.js / Express |
| **Storage** | IPFS / MongoDB (optional) |

---

## 🧩 Architecture Overview

---

## 🛠️ Local Setup

```bash
# Clone repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Install frontend dependencies
cd frontend
npm install

# Compile & test smart contracts
forge build
forge test

# Deploy contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast

# Run frontend
npm run dev

