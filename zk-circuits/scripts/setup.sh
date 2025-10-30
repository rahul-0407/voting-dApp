#!/bin/bash

echo "🔐 Starting trusted setup..."

cd build

# Download powers of tau if not exists
if [ ! -f "powersOfTau28_hez_final_12.ptau" ]; then
    echo "📥 Downloading powers of tau..."
    curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
fi

# Phase 1: Setup
echo "⚙️ Phase 1: Setup..."
npx snarkjs groth16 setup vote.r1cs powersOfTau28_hez_final_12.ptau vote_0000.zkey

# Phase 2: Contribute
echo "🎲 Phase 2: Contributing randomness..."
npx snarkjs zkey contribute vote_0000.zkey vote_final.zkey \
  --name="First contribution" \
  -v \
  -e="$(date +%s)"

# Export verification key
echo "📤 Exporting verification key..."
npx snarkjs zkey export verificationkey vote_final.zkey verification_key.json

# Generate Solidity verifier
echo "📝 Generating Solidity verifier..."
npx snarkjs zkey export solidityverifier vote_final.zkey Verifier.sol

# Copy Verifier to blockchain folder
echo "📋 Copying Verifier to blockchain folder..."
cp Verifier.sol ../../voting-blockchain/src/

cd ..

echo "✅ Trusted setup complete!"
echo ""
echo "📁 Generated files:"
echo "  - build/vote_final.zkey (proving key)"
echo "  - build/verification_key.json"
echo "  - build/Verifier.sol (copied to voting-blockchain/src/)"
echo ""
echo "📌 Next steps:"
echo "  1. Copy build/vote_js/vote.wasm to frontend/public/"
echo "  2. Copy build/vote_final.zkey to frontend/public/"