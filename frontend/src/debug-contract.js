// Save this as: frontend/src/utils/debug-contract.js
// Then call it from browser console or add a button to run it

import { getPollFactory } from "./contract.jsx";

export async function debugContract() {
  try {
    console.log("🔍 Starting contract debug...\n");

    const { contract, signerAddress } = await getPollFactory(false);
    if (!contract) {
      console.error("❌ Failed to get contract");
      return;
    }

    console.log("✅ Contract loaded at:", contract.target);
    console.log("✅ Your address:", signerAddress);
    console.log("\n" + "=".repeat(60) + "\n");

    // 1. Check total polls
    const totalPolls = await contract.getTotalPolls();
    console.log(`📊 Total polls in contract: ${totalPolls.toString()}`);

    if (totalPolls == 0) {
      console.log("\n❌ NO POLLS IN CONTRACT!");
      console.log("This means createPoll transaction didn't actually store the poll.");
      console.log("\nPossible reasons:");
      console.log("1. Transaction was sent to wrong contract address");
      console.log("2. Transaction reverted but showed as success");
      console.log("3. You're connected to different network than contract");
      return;
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // 2. Try to get all public polls
    console.log("📞 Calling getAllPublicPolls...");
    try {
      const publicPolls = await contract.getAllPublicPolls(signerAddress);
      console.log(`✅ Returned ${publicPolls.length} public polls`);
      
      if (publicPolls.length === 0) {
        console.log("\n⚠️ Contract has polls but getAllPublicPolls returns 0");
        console.log("This means your polls don't meet the criteria:");
        console.log("- Not Public visibility");
        console.log("- Not Active");
        console.log("- Start time is in the future");
        console.log("- End time has passed");
      } else {
        publicPolls.forEach((poll, i) => {
          console.log(`\nPoll ${i}:`);
          console.log("  ID:", poll.pollId);
          console.log("  Question:", poll.question);
          console.log("  Options:", poll.options);
          console.log("  Visibility:", poll.visible === 0 ? "Public" : "Private");
          console.log("  Voting Mode:", poll.votingMode === 0 ? "Standard" : "Anonymous");
          console.log("  Active:", poll.isActive);
          console.log("  Start:", new Date(Number(poll.startTime) * 1000).toLocaleString());
          console.log("  End:", new Date(Number(poll.endTime) * 1000).toLocaleString());
          console.log("  Current Time:", new Date().toLocaleString());
        });
      }
    } catch (error) {
      console.error("❌ getAllPublicPolls failed:", error);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // 3. Get polls you created
    console.log("📞 Calling getMyCreatedPolls...");
    try {
      const myPolls = await contract.getMyCreatedPolls(signerAddress);
      console.log(`✅ You created ${myPolls.length} polls`);
      
      myPolls.forEach((poll, i) => {
        console.log(`\nYour Poll ${i}:`);
        console.log("  ID:", poll.pollId);
        console.log("  Question:", poll.question);
        console.log("  Visibility:", poll.visible === 0 ? "Public" : "Private");
        console.log("  Active:", poll.isActive);
        const startTime = Number(poll.startTime) * 1000;
        const endTime = Number(poll.endTime) * 1000;
        const now = Date.now();
        console.log("  Start:", new Date(startTime).toLocaleString());
        console.log("  End:", new Date(endTime).toLocaleString());
        console.log("  Now:", new Date(now).toLocaleString());
        console.log("  Started?", now >= startTime);
        console.log("  Ended?", now > endTime);
      });
    } catch (error) {
      console.error("❌ getMyCreatedPolls failed:", error);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // 4. Check network
    console.log("🌐 Checking network...");
    const provider = contract.runner.provider;
    const network = await provider.getNetwork();
    console.log("  Chain ID:", network.chainId.toString());
    console.log("  Network Name:", network.name);
    
    const blockNumber = await provider.getBlockNumber();
    console.log("  Current Block:", blockNumber);

    console.log("\n✅ Debug complete!");

  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  window.debugContract = debugContract;
  console.log("✅ Debug function loaded! Run: debugContract()");
}