pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template VoteCircuit() {
    // === INPUTS ===
    signal input secret;            // user's private secret
    signal input optionIndex;       // option selected (0..9)
    signal input contractAddress;   // address of PollFactory
    signal input pollIdHash;        // hash of pollId

    // === OUTPUTS ===
    signal output nullifier;        // computed nullifier (Poseidon(secret, pollIdHash))
    signal output optionIndexOut;   // to mirror optionIndex for verification

    // --- Nullifier computation ---
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== pollIdHash;
    nullifier <== nullifierHasher.out;

    // --- Validate optionIndex < 10 ---
    component lessThan = LessThan(4);
    lessThan.in[0] <== optionIndex;
    lessThan.in[1] <== 10;
    lessThan.out === 1;

    // --- Ensure secret is non-zero ---
    component isZero = IsZero();
    isZero.in <== secret;
    isZero.out === 0;

    optionIndexOut <== optionIndex;
}

// ✅ FIXED: Only input signals can be declared public
component main {public [contractAddress, pollIdHash, optionIndex]} = VoteCircuit();
