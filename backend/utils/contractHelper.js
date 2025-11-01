import { ethers } from "ethers";
import ABI from "./abi.json" with { type: "json" };

// RPC URL and private key (server wallet)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance
const pollContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  ABI,
  wallet
);

export const endPollOnChain = async (pollId) => {
  try {
    const tx = await pollContract.endPoll(pollId);
    await tx.wait(); // wait for confirmation
    console.log(`✅ Poll ${pollId} ended on blockchain`);
  } catch (err) {
    console.error(`❌ Failed to end poll ${pollId} on blockchain:`, err);
  }
}