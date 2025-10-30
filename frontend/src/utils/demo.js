import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/C6LvWCaOCHnDuTlpmwfD7JQFkdsXCMC-"
);

const contractAddress = "0xEEbB1b01baD611fb37Fbc2E1a2E6598195cB9539";

async function checkDeployment() {
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    console.log("❌ Contract not deployed (no bytecode found).");
  } else {
    console.log("✅ Contract deployed! Bytecode found.");
  }
}

checkDeployment();
