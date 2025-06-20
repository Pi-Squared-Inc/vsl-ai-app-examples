"use client";

import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { VerificationRecord } from "@/types";
import { getSettledClaimById } from "../actions/vsl";

interface ValidationRecordInputCell {
  record: VerificationRecord;
  onViewError: (title: string, content: string) => void;
}

async function fetchInputFromVSL(record: VerificationRecord) {
  // Reconstruct input from claim stored on VSL, and cache it
  let input = JSON.parse(
      (await getSettledClaimById(record.claim_id!)).
      data.verified_claim.claim).
      input[0]

  if (record.type == "plain_text") {
    input = await fetch('data:text/plain;base64,' + input).
              then((input) => input.blob()).
              then((input) => input.text())
    const blobURL = URL.createObjectURL(new Blob(
                [input], {
                  type: 'text/plain'
                })
          )
    sessionStorage.setItem(record.id, blobURL)
    return blobURL
  } else {
    input = await fetch('data:text/plain;base64,' + input).
              then((input) => input.blob())
    const blobURL = URL.createObjectURL(input)
    sessionStorage.setItem(record.id, blobURL)
    return blobURL
  }
}

export function ValidationRecordInputCell({ record, onViewError }: ValidationRecordInputCell) {
  let blobURL = sessionStorage.getItem(record.id);

  const canShowInput = blobURL != null || record.status == "completed"

  const handleShowResultData = async () => {
    if (!blobURL) {
      blobURL = await fetchInputFromVSL(record);
    }
    if (record.type == "plain_text") {
      let blobText = await (await fetch(blobURL!).then(r => r.blob())).text();
      onViewError("Input", blobText);
    } else {
      onViewError("Input", blobURL!);
    }
  };

  return (
    <TableCell className="px-4 align-middle">
      {canShowInput ?
        <Button size="sm" onClick={handleShowResultData} className="flex-shrink-0 bg-pi2-accent-white text-pi2-accent-black hover:bg-pi2-accent-white/90">
          View
        </Button>
        : "-"
      }
    </TableCell>
  );
}
