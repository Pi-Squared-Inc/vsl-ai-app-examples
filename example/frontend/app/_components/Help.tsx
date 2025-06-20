"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog } from "./Dialog";

function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isHelp, setIsHtml] = useState(true);
  const [isJson, setIsJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    state: { isOpen, title, content, isJson, isHelp, isLoading },
    setTitle,
    setContent,
    setIsJson,
    setIsHtml,
    setIsLoading,
    open,
    close,
  };
}

export default function Help() {
  const helpTitle = "Help! What do I do?";
  const helpDialog = useDialog();
  const handleClick = () => {
    helpDialog.setTitle(helpTitle);
    helpDialog.setIsJson(false);
    helpDialog.setIsLoading(false);
    helpDialog.open();
    console.log("handleClick");
  };
  return (
    <>
      <Button size="lg" variant="outline" onClick={handleClick}>
        What is this?
      </Button>
      <Dialog
        isOpen={helpDialog.state.isOpen}
        onClose={helpDialog.close}
        title={helpDialog.state.title}
        content={helpDialog.state.content}
        isJson={helpDialog.state.isJson}
        isHelp={helpDialog.state.isHelp}
        isLoading={helpDialog.state.isLoading}
      />
    </>
  );
}
