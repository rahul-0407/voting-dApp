#!/bin/bash

echo "🔧 Compiling circuit..."

# Compile with library path
circom circuits/vote.circom \
  --r1cs \
  --wasm \
  --sym \
  -o build/ \
  -l node_modules

if [ $? -eq 0 ]; then
    echo "✅ Circuit compiled successfully!"
    echo "📁 Output:"
    echo "  - build/vote.r1cs"
    echo "  - build/vote_js/vote.wasm"
    echo "  - build/vote.sym"
    
    # Check circuit info
    echo ""
    echo "📊 Circuit information:"
    npx snarkjs r1cs info build/vote.r1cs
else
    echo "❌ Circuit compilation failed!"
    exit 1
fi