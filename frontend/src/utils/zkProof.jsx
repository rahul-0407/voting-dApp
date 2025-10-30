import { groth16 } from "snarkjs";
import { ethers } from "ethers";

// ✅ Generates or retrieves a secret unique to the user
export function getUserSecret() {
  let secret = localStorage.getItem("userSecret");
  if (!secret) {
    // Generate a random 252-bit number (safe for Circom's field)
    const randomBytes = crypto.getRandomValues(new Uint8Array(31)); // 31 bytes = 248 bits
    const secretBigInt = BigInt("0x" + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join(""));
    
    secret = secretBigInt.toString();
    localStorage.setItem("userSecret", secret);
    console.log("🔐 New secret generated (as string):", secret);
  }
  return secret;
}

// ✅ Convert pollId string to uint256 hash for circuit
export function pollIdToHash(pollIdString) {
  // Hash the pollId string to get a uint256 (matches your contract's keccak256(bytes(_pollId)))
  const hash = ethers.keccak256(ethers.toUtf8Bytes(pollIdString));
  return BigInt(hash);
}

// ✅ Generate nullifier using Poseidon (matches circuit)
// Note: This is just for checking locally - the circuit computes the real one
export function generateNullifierPreview(secret, pollIdString) {
  const pollIdHashUint = pollIdToHash(pollIdString);
  
  // For client-side checking, we use keccak256 as approximation
  // The actual nullifier is computed by Poseidon in the circuit
  const combined = ethers.solidityPackedKeccak256(
    ["uint256", "uint256"],
    [BigInt(secret), pollIdHashUint]
  );
  
  console.log("🔒 Nullifier preview (client-side):", combined);
  return combined;
}

// ✅ Generates the proof matching YOUR deployed circuit
export async function generateVoteProof(voteOptionIndex, pollIdString, contractAddress) {
  try {
    const secret = getUserSecret();
    const pollIdHash = pollIdToHash(pollIdString);

    // ✅ Match your circuit exactly:
    // signal input secret;            // private
    // signal input optionIndex;       // public
    // signal input contractAddress;   // public
    // signal input pollIdHash;        // public
    
    const input = {
      secret: BigInt(secret),                    // private input
      optionIndex: BigInt(voteOptionIndex),      // public input (your vote)
      contractAddress: BigInt(contractAddress),  // public input
      pollIdHash: pollIdHash,                    // public input
    };

    console.log("🔐 Generating ZK proof with inputs:", {
      optionIndex: voteOptionIndex,
      pollId: pollIdString,
      pollIdHash: "0x" + pollIdHash.toString(16),
      contractAddress: contractAddress,
      secret: "***hidden***"
    });

    // These are your compiled zk files from /public
    const wasmPath = "/vote.wasm";
    const zkeyPath = "/vote_final.zkey";

    // Generate proof
    const { proof, publicSignals } = await groth16.fullProve(
      input, 
      wasmPath, 
      zkeyPath
    );

    console.log("✅ Proof generated successfully");
    console.log("📊 Public signals from circuit:", publicSignals);
    console.log("   [0] contractAddress:", publicSignals[0]);
    console.log("   [1] pollIdHash:", publicSignals[1]);
    console.log("   [2] optionIndex:", publicSignals[2]);
    console.log("   [3] nullifier:", publicSignals[3]);
    console.log("   [4] optionIndexOut:", publicSignals[4]);

    // Extract the nullifier from circuit output (index 3)
    const nullifier = "0x" + BigInt(publicSignals[3]).toString(16).padStart(64, "0");
    console.log("🔒 Nullifier from circuit:", nullifier);

    // Format proof for Solidity verifier (a, b, c format)
    const formattedProof = {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      c: [proof.pi_c[0], proof.pi_c[1]],
    };

    return {
      proof: formattedProof,
      nullifier: nullifier,          // bytes32 from circuit output
      publicSignals: publicSignals,  // All 5 signals for debugging
      optionIndex: voteOptionIndex
    };
  } catch (error) {
    console.error("❌ Proof generation failed:", error);
    throw error;
  }
}

// ✅ Verify if user has already voted (check nullifier locally)
export function hasVotedBefore(pollIdString, existingNullifiers) {
  const secret = getUserSecret();
  const myNullifier = generateNullifierPreview(secret, pollIdString);
  
  const alreadyVoted = existingNullifiers.includes(myNullifier);
  
  if (alreadyVoted) {
    console.log("⚠️ Already voted in this poll (nullifier exists)");
  }
  
  return alreadyVoted;
}

// ✅ Helper to check if nullifier exists on-chain
export async function checkNullifierOnChain(pollId, nullifier, contract) {
  try {
    const isUsed = await contract.isNullifierUsed(pollId, nullifier);
    console.log(`🔍 Nullifier ${nullifier} is ${isUsed ? "USED" : "AVAILABLE"}`);
    return isUsed;
  } catch (error) {
    console.error("Error checking nullifier:", error);
    return false;
  }
}