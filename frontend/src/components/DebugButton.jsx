// import { getPollFactory } from "../utils/contract";
// import { ethers } from "ethers";

// export default function DebugButton() {
//   const handleDebug = async () => {
//     try {
//       console.log("🔍 Starting zkSync contract debug...\n");

//       // Use provider directly instead of signer for view functions
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const signerAddress = await signer.getAddress();

//       console.log("✅ Your address:", signerAddress);
//       console.log("✅ Contract address: 0x48134BABf6a76f34f76dCFACD8a9873dC4F43035");

//       // Load ABI
//       const abiResponse = await fetch('/abi/PollFactory.json');
//       const abiJSON = await abiResponse.json();
//       const abi = abiJSON.abi || abiJSON;

//       // Create contract instance with PROVIDER (not signer) for view functions
//       const contract = new ethers.Contract(
//         "0x48134BABf6a76f34f76dCFACD8a9873dC4F43035",
//         abi,
//         provider  // Using provider for zkSync compatibility
//       );

//       console.log("\n📞 Calling getTotalPolls...");
//       try {
//         const totalPolls = await contract.getTotalPolls();
//         console.log(`✅ Total polls: ${totalPolls.toString()}`);

//         if (totalPolls == 0) {
//           alert("❌ No polls in contract!\n\nThe contract exists but has no polls stored.");
//           return;
//         }

//         // Get your created polls
//         console.log("\n📞 Calling getMyCreatedPolls...");
//         const myPolls = await contract.getMyCreatedPolls(signerAddress);
//         console.log(`✅ You created ${myPolls.length} polls:`);
        
//         myPolls.forEach((poll, i) => {
//           const startTime = Number(poll.startTime) * 1000;
//           const endTime = Number(poll.endTime) * 1000;
//           const now = Date.now();
          
//           console.log(`\n📊 Poll ${i + 1}:`);
//           console.log("  ID:", poll.pollId);
//           console.log("  Question:", poll.question);
//           console.log("  Options:", poll.options);
//           console.log("  Visibility:", poll.visible === 0 ? "Public" : "Private");
//           console.log("  Voting Mode:", poll.votingMode === 0 ? "Standard" : "Anonymous");
//           console.log("  Active:", poll.isActive);
//           console.log("  Start:", new Date(startTime).toLocaleString());
//           console.log("  End:", new Date(endTime).toLocaleString());
//           console.log("  Now:", new Date(now).toLocaleString());
//           console.log("  Started?", now >= startTime ? "✅" : "❌");
//           console.log("  Ended?", now > endTime ? "❌ YES" : "✅ NO");
//         });

//         // Try getAllPublicPolls
//         console.log("\n📞 Calling getAllPublicPolls...");
//         const publicPolls = await contract.getAllPublicPolls(signerAddress);
//         console.log(`✅ Public polls: ${publicPolls.length}`);

//         if (publicPolls.length > 0) {
//           publicPolls.forEach((poll, i) => {
//             console.log(`\nPublic Poll ${i + 1}:`, poll.pollId, "-", poll.question);
//           });
//         }

//         alert(
//           `✅ Debug Complete!\n\n` +
//           `Total Polls: ${totalPolls}\n` +
//           `Your Polls: ${myPolls.length}\n` +
//           `Public Polls: ${publicPolls.length}\n\n` +
//           `Check console for details!`
//         );

//       } catch (callError) {
//         console.error("❌ Contract call failed:", callError);
//         alert(
//           "❌ Contract call failed!\n\n" +
//           callError.message + "\n\n" +
//           "This might be a zkSync-specific issue. The contract exists but view functions aren't working properly."
//         );
//       }

//     } catch (error) {
//       console.error("❌ Debug failed:", error);
//       alert("Debug failed: " + error.message);
//     }
//   };

//   return (
//     <button
//       onClick={handleDebug}
//       className="px-6 py-3 bg-purple-500/20 text-purple-300 rounded-full font-medium text-sm hover:bg-purple-500/30 transition-all duration-200 border border-purple-500/30"
//     >
//       🔍 Debug Contract
//     </button>
//   );
// }