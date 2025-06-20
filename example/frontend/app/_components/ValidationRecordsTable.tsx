import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Dialog } from "./Dialog";
import { Pagination } from "./Pagination";
import { ValidationRecordRow } from "./ValidationRecordRow";
import { ValidationRecordsTableHeaderCell } from "./ValidationRecordsTableHeaderCell";
import { VerificationRecord } from "@/types";

const SKELETON_ROWS = 25;

function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isJson, setIsJson] = useState(false);
  const [isImageBlobURL, setIsImageBlobURL] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    state: { isOpen, title, content, isJson, isImageBlobURL, isLoading },
    setTitle,
    setContent,
    setIsJson,
    setIsImageBlobURL,
    setIsLoading,
    open,
    close,
  };
}

interface ValidationRecordsTableProps {
  records: VerificationRecord[];
  isLoading: boolean;
  isPaging?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  userHistoryOnly: boolean;
  address?: string;
}

export function ValidationRecordsTable({ records, isLoading, isPaging = false, currentPage, totalPages, onPageChange, userHistoryOnly = false, address = undefined}: ValidationRecordsTableProps) {
  if (userHistoryOnly && address == null) {
    return <div className="flex justify-center items-center h-full"> {/* Centers horizontally and vertically if parent allows */}
              <p className="text-2xl text-center mt-12">
                Connect your wallet to see your own computation history!
              </p>
           </div>
  }
  const dialog = useDialog();

  const effectiveTotalPages = useMemo(() => (totalPages > 0 ? totalPages : 1), [totalPages]);

  const skeletonRows = useMemo(() => {
    const numCols = 4;
    return Array.from({ length: SKELETON_ROWS }).map((_, index) => (
      <TableRow key={`skeleton-${index}`} className="animate-pulse h-[53px]" style={{ animationDelay: `${index * 50}ms` }}>
        {[...Array(numCols)].map((_, i) => (
          <TableCell key={i} className="px-4 align-middle">
            <Skeleton className="h-6 w-24" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }, []);

  const handleViewError = (title: string, content: string, isImage: boolean = false) => {
    dialog.setTitle(title);
    dialog.setContent(content);
    dialog.setIsJson(false);
    dialog.setIsImageBlobURL(isImage);
    dialog.setIsLoading(false);
    dialog.open();
  };

  return (
    <section aria-label="Validation Records data" className="records-table-container">
      <Dialog
        isOpen={dialog.state.isOpen}
        onClose={dialog.close}
        title={dialog.state.title}
        content={dialog.state.content}
        isJson={dialog.state.isJson}
        isImageBlobURL={dialog.state.isImageBlobURL}
        isLoading={dialog.state.isLoading}
      />

      <ScrollArea className="w-full">
        <Table className="table-fixed w-full min-w-[1040px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <ValidationRecordsTableHeaderCell>{`Created At`}</ValidationRecordsTableHeaderCell>
              <ValidationRecordsTableHeaderCell>{`Type`}</ValidationRecordsTableHeaderCell>
              <ValidationRecordsTableHeaderCell>{`Status`}</ValidationRecordsTableHeaderCell>
              <ValidationRecordsTableHeaderCell>{`Claim`}</ValidationRecordsTableHeaderCell>
              <ValidationRecordsTableHeaderCell>{`Input`}</ValidationRecordsTableHeaderCell>
              <ValidationRecordsTableHeaderCell>{`Result`}</ValidationRecordsTableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody className={cn("transition-opacity duration-200", isPaging && "opacity-60")}>
            {isLoading && !isPaging ? (
              <>{skeletonRows}</>
            ) : records?.length > 0 ? (
              records?.map((record) => (
                <ValidationRecordRow
                  key={record.id}
                  record={record}
                  //  onViewData={handleViewData}
                  onViewError={handleViewError}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 px-4">
                  No verification records available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="mt-6">
        <Pagination currentPage={currentPage} totalPages={effectiveTotalPages} onPageChange={onPageChange} disabled={isLoading || isPaging} />
      </div>
    </section>
  );
}
