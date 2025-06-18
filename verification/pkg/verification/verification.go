package verification

import (
	"fmt"
	"log"

	types "base-tee/pkg/abstract_types"

	pb "github.com/google/go-tpm-tools/proto/attest"
	gotpm "github.com/google/go-tpm-tools/server"
	"google.golang.org/protobuf/proto"
)

func VerifyTEEComputationClaim(claim *types.TEEComputationClaim, verificationContext *types.TEEComputationClaimVerificationContext) error {
	log.Println("Verifying claim...")

	// Step 1: Check the signatures and well-formedness of the attestation report
	// Signatures includes both TEE signature and TPM signature.
	trustedAKs, err := getTrustedAKs()
	if err != nil {
		return fmt.Errorf("couldn't verify claim, failed to get trusted keys: %w", err)
	}

	attestation := &pb.Attestation{}
	err = proto.Unmarshal(verificationContext.Attestation, attestation)
	if err != nil {
		return fmt.Errorf("failed to unmarshal: %w", err)
	}

	machineState, err := gotpm.VerifyAttestation(attestation, gotpm.VerifyOpts{
		Nonce:      claim.Nonce,
		TrustedAKs: trustedAKs,
	})
	if err != nil {
		return fmt.Errorf("failed to verify: %w", err)
	}

	// At this point, we know have an authentic & untampered attestation report from a
	// real TEE environment.
	//
	// Step 2: Check the measurements inside the report using the appraisal policy supplied
	// in the verificationContext.
	//
	// NOTE: This is just a stub. The verificationContext.Policy field is not properly filled.
	// More documentation on attest.Policy is needed: what exactly can it check? Do we need to use
	// a lower level library than go-tpm-tools?
	policy, err := getAttestationPolicy()
	if err != nil {
		return fmt.Errorf("couldn't verify claim, failed to get attestation policy: %w", err)
	}
	err = gotpm.EvaluatePolicy(machineState, policy)
	if err != nil {
		return fmt.Errorf("attestation report failed appraisal policy: %w", err)
	}

	if !machineState.GetSecureBoot().GetEnabled() {
		return fmt.Errorf("secure boot not enabled")
	}

	err = verifyQuotes(attestation.GetQuotes(), claim.DigestHistory)
	if err != nil {
		return err
	}

	log.Println("Verified!")
	return nil
}
