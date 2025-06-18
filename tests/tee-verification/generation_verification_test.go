package verification

import (
	claims "base-tee/pkg/abstract_types"
	"encoding/json"
	"generation/pkg/generation"
	"io"
	"os"
	"testing"
	verification "verification/pkg/verification"
)

type JSONContext struct {
	Report []byte `json:"report"`
	Nonce  []byte `json:"nonce"`
}

func TestVerifyTEEComputationClaim(t *testing.T) {
	// Load mock claim JSON from file
	mockClaimFile, err := os.Open("./tee_computation_test_mock_claim.json")
	if err != nil {
		t.Fatalf("Failed to open mock claim file: %v", err)
	}
	defer mockClaimFile.Close()

	mockClaimJSON, err := io.ReadAll(mockClaimFile)
	if err != nil {
		t.Fatalf("Failed to read mock claim file: %v", err)
	}

	var parsedMockClaim claims.TEEComputationClaim
	err = json.Unmarshal(mockClaimJSON, &parsedMockClaim)
	if err != nil {
		t.Fatalf("Failed to unmarshal mock claim: %v", err)
	}

	// Load mock verification context JSON from file
	mockVerificationContextFile, err := os.Open("./tee_computation_test_mock_report.json")
	if err != nil {
		t.Fatalf("Failed to open mock verification context file: %v", err)
	}
	defer mockVerificationContextFile.Close()

	mockVerificationContextJSON, err := io.ReadAll(mockVerificationContextFile)
	if err != nil {
		t.Fatalf("Failed to read mock verification context file: %v", err)
	}

	var mockVerificationContext JSONContext
	err = json.Unmarshal(mockVerificationContextJSON, &mockVerificationContext)
	if err != nil {
		t.Fatalf("Failed to unmarshal mock verification context: %v", err)
	}

	mockClaim, mockContext, err := generation.GenerateTEEComputationClaim(parsedMockClaim.Computation, parsedMockClaim.Input, parsedMockClaim.Result, mockVerificationContext.Report, parsedMockClaim.Nonce)
	if err != nil {
		t.Fatalf("Failed to generate TEE computation claim: %v", err)
	}

	err = verification.VerifyTEEComputationClaim(mockClaim, mockContext)
	if err != nil {
		t.Fatalf("Failed to verify TEE computation claim: %v", err)
	}
}
