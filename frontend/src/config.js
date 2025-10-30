// // /frontend/src/config.js
// // import deployedAddresses from "../../voting-blockchain/deployed-addresses.json";
// import { ethers } from "ethers";

// // ✅ Contract addresses
// export const CONTRACT_ADDRESSES = {
//   pollFactory: deployedAddresses.pollFactory,
//   verifier: deployedAddresses.verifier,
// };

// // ✅ Backend endpoint
// export const BACKEND_URL =
//   import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// // ✅ Helper: get connected provider & signer
// export async function getProviderAndSigner(requireLogin = false) {
//   try {
//     if (!window.ethereum) {
//       alert("MetaMask not installed");
//       return null;
//     }

//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const accounts = requireLogin
//       ? await provider.send("eth_requestAccounts", [])
//       : await provider.send("eth_accounts", []);

//     if (accounts.length === 0) {
//       if (requireLogin) {
//         alert("Please connect your wallet first");
//       }
//       return null;
//     }

//     const signer = await provider.getSigner();
//     const signerAddress = await signer.getAddress();
    
//     console.log("✅ Connected wallet:", signerAddress);
    
//     return { provider, signer, signerAddress };
//   } catch (error) {
//     console.error("❌ Provider/Signer error:", error);
//     alert("Error connecting to wallet: " + error.message);
//     return null;
//   }
// }

// // ✅ Get any contract by name ("pollFactory" or "verifier")
// export async function getContract(name, requireLogin = false) {
//   try {
//     const providerData = await getProviderAndSigner(requireLogin);
//     if (!providerData) return null;

//     const { signer, signerAddress } = providerData;

//     // Fetch ABI from public folder
//     const abiPath = `/abi/${name === "verifier" ? "Verifier.json" : "PollFactory.json"}`;
    
//     console.log(`📄 Fetching ABI from: ${abiPath}`);
    
//     const response = await fetch(abiPath);
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch ABI: ${response.status} ${response.statusText}`);
//     }
    
//     const abiJSON = await response.json();
    
//     // Extract ABI - Hardhat artifacts have it nested under 'abi' property
//     const abi = abiJSON.abi || abiJSON;
    
//     console.log(`📄 ABI loaded for ${name}:`, abi ? "✅ Found" : "❌ Not found");
    
//     if (!abi || (Array.isArray(abi) && abi.length === 0)) {
//       throw new Error(`ABI not found or empty for contract: ${name}`);
//     }

//     const contractAddress = CONTRACT_ADDRESSES[name];
//     if (!contractAddress) {
//       throw new Error(`Contract address not found for: ${name}`);
//     }

//     console.log(`✅ Loading ${name} contract at:`, contractAddress);

//     const contract = new ethers.Contract(contractAddress, abi, signer);

//     return { contract, signerAddress };
//   } catch (error) {
//     console.error(`❌ Error loading ${name} contract:`, error);
//     alert(`Failed to load ${name} contract: ` + error.message);
//     throw error;
//   }
// }