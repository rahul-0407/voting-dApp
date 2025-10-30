// // /frontend/src/utils/contract.jsx
// import { getContract } from "../config.js";

// // 🗳️ Get PollFactory contract
// export async function getPollFactory(requireLogin = false) {
//   return await getContract("pollFactory", requireLogin);
// }

// // 🔐 Get Verifier contract
// export async function getVerifier(requireLogin = false) {
//   return await getContract("verifier", requireLogin);
// }




import { ethers } from "ethers";
import abi from "./abi.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getContract = async (requireLogin = false) => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not installed");
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  let accounts = [];

  if(requireLogin){
    accounts  = await provider.send("eth_requestAccounts", []);
  } else {
    accounts = await provider.send("eth_accounts", []);
  }

  if(accounts.length === 0){
    return null;
  }
  
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  return {contract, signerAddress};

};
