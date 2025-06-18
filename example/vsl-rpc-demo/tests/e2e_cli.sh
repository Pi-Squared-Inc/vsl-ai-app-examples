# This script runs the whole pipeline via the CLI commands:
#   1. It creates accoutns for the client and the verifier
#   2. It spins a mock attestation server that serves a valid attestation report for
#           image classification on the goldfish sample image
#   3. It runs the client and verifier
#   4. If no errors occur, it checks that the client and verifier's balances
#           updated accordingly at the end of the workflow

set -euo pipefail

go build

# Create new accounts for client and verifier, update .env
./vsl-rpc-demo gen-address client
./vsl-rpc-demo gen-address verifier

source .env

# Get initial balances of client and verifier
balance_output=$(./vsl-rpc-demo check-balance $CLIENT_ADDR 2>&1)
client_initial_balance=$(echo "$balance_output" | grep "Balance (in attos):" | awk '{print $NF}')

balance_output=$(./vsl-rpc-demo check-balance $VERIFIER_ADDR 2>&1)
verifier_initial_balance=$(echo "$balance_output" | grep "Balance (in attos):" | awk '{print $NF}')

# Run mock server that serves static attestation on port 6000:
{ echo -ne "HTTP/1.0 200 OK\r\nContent-Length: $(wc -c <tests/goldfish_report.out)\r\n\r\n"; cat tests/goldfish_report.out; } | nc -l 6000 &

# Run verifier in the background (it will keep polling until it verifies exactly 1 claim)
./vsl-rpc-demo verifier --num-claims 1 &

# Run client for image classification
fee=100
./vsl-rpc-demo client img_class --img ../common/attester/inference/src/sample/goldfish.jpeg --fee $fee --zero-nonce

# Get final balances of client and verifier
balance_output=$(./vsl-rpc-demo check-balance $CLIENT_ADDR 2>&1)
client_balance=$(echo "$balance_output" | grep "Balance (in attos):" | awk '{print $NF}')

balance_output=$(./vsl-rpc-demo check-balance $VERIFIER_ADDR 2>&1)
verifier_balance=$(echo "$balance_output" | grep "Balance (in attos):" | awk '{print $NF}')

validate_fee=1
expected_client_balance=$(echo "$client_initial_balance - $fee - $validate_fee" | bc)
# Check balances, exit with non-zero if not as expected:
if [ $client_balance != $expected_client_balance ]; then
    echo "Error: Client balance assertion failed"
    echo "Expected: $expected_client_balance"
    echo "Actual: $client_balance"
    exit 1
fi
expected_verifier_balance=$(echo "$verifier_initial_balance + $fee - $validate_fee" | bc)
if [ $verifier_balance != $expected_verifier_balance ]; then
    echo "Error: Client balance assertion failed"
    echo "Expected: $expected_verifier_balance"
    echo "Actual: $verifier_balance"
    exit 1
fi
