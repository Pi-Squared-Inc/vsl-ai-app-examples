import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import WalletConnect from "./Account";
import cvImage from "../_assets/help_cv.png";
import Image from "next/image";

// Dynamically import ReactJson to avoid SSR issues
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isJson?: boolean;
  isHelp?: boolean;
  isImageBlobURL?: boolean;
  isLoading?: boolean;
}

const HelpDisplay = () => (
<div className="flex flex-col p-1 rounded-lg shadow-lg text-gray-800 dark:text-gray-200 max-w-3xl mx-auto my-1">
  <p className="text-lg text-left mb-2">
    This website showcases simple AI capabilities inside TEEs,
    settled by <b>Pi Squared</b> on the <b>VSL</b>.
  </p>
  <p className="text-lg text-left">
    To get started, first click the &quot;Connect&quot; button in the upper-right corner
    to connect your Metamask wallet, or connect using the button below:
  </p>
  <div className="flex justify-center mb-2">
    <WalletConnect />
  </div>
  <p className="text-lg text-left">
    To perform an <b>image classification</b> task, drag or upload your image to the form and click &quot;Confirm&quot; (max size is 10MB).
    Or click the goldfish below the form to use our sample image:
  </p>
  <div className="text-lg flex justify-center">
    <Image src={cvImage} alt="Image clasification how-to" width={500} height={80} className="rounded" />
  </div>
  <p className="text-lg text-left mb-2">
    Then accept the two Metamask signature requests, which will allow payment and and authorization of your AI request.
    Each request is charged <b>20 VSL</b>.
  </p>
    <p className="text-lg text-left mb-2">
    To perform a <b>text generation</b> task, switch the computation type to Plain text and write a prompt (max 100 characters).
    Sign as before, and wait for the result!
  </p>
    <p className="text-lg text-left">
    Once your request is completed, click the &quot;View&quot; button under the &quot;Result&quot; column to see the model&apos;s output.

    The computation is now settled on the VSL. Follow the claim ID to visit the settled claim on the <b>VSL explorer</b>.
  </p>
</div>
);

export function Dialog({
  isOpen,
  onClose,
  title,
  content,
  isJson = false,
  isImageBlobURL = false,
  isHelp = false,
  isLoading = false,
}: DialogProps) {
  if (!isOpen) return null;

  // Display loading indicator when in loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background border border-border text-foreground rounded-lg shadow-lg w-11/12 max-w-3xl">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading data...
            </p>
          </div>
          <div className="p-4 border-t border-border flex justify-end">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Format JSON content or display plain text
  let contentDisplay;
  if (isJson) {
    try {
      // Parse JSON string to object
      const jsonData = JSON.parse(content);

      // Use react-json-view to display JSON data
      contentDisplay = (
        <div className="p-4 rounded overflow-auto max-h-[80vh]">
          <ReactJson
            src={jsonData}
            theme="monokai"
            name={null}
            displayDataTypes={false}
            displayObjectSize={true}
            enableClipboard={true}
            collapsed={1}
            collapseStringsAfterLength={80}
            style={{
              fontFamily: "monospace",
              fontSize: "0.9rem",
              overflowX: "auto",
            }}
          />
        </div>
      );
    } catch (error) {
      // Display error message if JSON parsing fails
      contentDisplay = (
        <pre className="bg-muted text-wrap whitespace-pre-line p-4 rounded overflow-auto max-h-[80vh] text-sm text-destructive">
          Failed to parse JSON:{" "}
          {error instanceof Error ? error.message : String(error)}
        </pre>
      );
    }
  } else if (isHelp) {
    // Help dialogs displays a nicely formatted constant message
    contentDisplay = HelpDisplay();
  } else if (isImageBlobURL) {
    contentDisplay = <Image src={content} width={300} height={300} alt="Input image to CV computation" />
  }
  else {
    // For non-JSON content, display as plain text
    contentDisplay = (
      <pre className="bg-muted text-wrap whitespace-pre-line p-4 rounded overflow-auto max-h-[80vh] text-sm text-foreground">
        {content}
      </pre>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border text-foreground rounded-lg shadow-lg w-11/12 max-w-3xl">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{contentDisplay}</div>
        <div className="p-4 border-t border-border flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format bytes to a readable format
// Removed formatBytes function as it's now imported from utils
