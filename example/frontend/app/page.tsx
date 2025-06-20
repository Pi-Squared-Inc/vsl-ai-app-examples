"use client";

import SubmitForm from "./_components/SubmitForm";
import { Footer } from "./_components/Footer";
import { NavigationBar } from "./_components/NavigationBar";
import { ValidationRecordsTable } from "./_components/ValidationRecordsTable";
import { useCallback, useEffect, useRef, useState } from "react";
import { get } from "es-toolkit/compat";
import { VerificationRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";

const PAGE_SIZE = 25;
const REFRESH_INTERVAL = 10; // seconds

export default function Home() {
  const all_route = 'verification_records';

  const [isFetching, setIsFetching] = useState(false);
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiRoute, setApiRoute] = useState(all_route);
  const [userHistoryOnly, setUserHistoryOnly] = useState(false);
  const { address } = useAccount();

  const fetchRecords = useCallback(async (page: number, pageSize: number) => {
    try {
      setIsFetching(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${apiRoute}?page=${page}&page_size=${pageSize}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const records = get<VerificationRecord[]>(data, "records", []);
        const totalCount = get<number>(data, "total", 0);
        setTotal(totalCount);
        setRecords(records);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setIsFetching(false);
    }
  }, [apiRoute, userHistoryOnly]);

  useEffect(() => {
    // Initial fetch to load records when the provider mounts
    fetchRecords(0, PAGE_SIZE);
  }, [fetchRecords]);

  const refetch = useCallback(
    async (backToFirst = false) => {
      let page = currentPage;
      if (backToFirst) {
        page = 1;
      }
      setCurrentPage(page);
      await fetchRecords(Math.max(page - 1, 0), PAGE_SIZE);
    },
    [fetchRecords, currentPage]
  );

  const goToPage = useCallback(
    async (page: number) => {
      const index = page - 1;
      if (index >= 0 && index < total / PAGE_SIZE) {
        setCurrentPage(page);
        await fetchRecords(index, PAGE_SIZE);
        // If the page is valid, fetch records for that page
      }
    },
    [fetchRecords, total]
  );

  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(REFRESH_INTERVAL);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleRefresh = useCallback(() => {
    if (isFetching) return;
    try {
      refetch();
    } catch (error) {
      console.error("Error during auto-refresh:", error);
    }
    setSecondsUntilRefresh(REFRESH_INTERVAL);
  }, [isFetching, refetch]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [handleRefresh]);

  useEffect(() => {
    if (userHistoryOnly) {
      const addr = address ? address : '0xDEADBEEF'
      setApiRoute(`${all_route}/${addr}`);
    } else {
      setApiRoute(all_route);
    }
    goToPage(1);
  }, [userHistoryOnly, address, goToPage]);

  function HistoryChooser() {
    if (userHistoryOnly) {
      return (
        <h2 className="text-2xl font-medium mb-4">
          <span
            id="switch-to-all"
            title="View all AI computation history"
            style={{ opacity: 0.5, cursor: "pointer" }}
            onClick={() => {
              setUserHistoryOnly(false);
            }}
          >
            All History |{" "}
          </span>
          Your History
        </h2>
      );
    } else {
      return (
        <h2 className="text-2xl font-medium mb-4">
          All History
          <span
            id="switch-to-you"
            title="View your own AI computation history"
            style={{ opacity: 0.5, cursor: "pointer" }}
            onClick={() => {
              setUserHistoryOnly(true);
            }}
          >
            {" "}
            | Your History
          </span>
        </h2>
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
      <NavigationBar />
      <main className="flex-grow flex flex-col gap-6">
        <div>
          <h1 className="text-5xl text-center mb-12 font-medium bg-gradient-to-r from-pi2-purple-500 to-pi2-accent-white text-transparent bg-clip-text">
            Trusted Execution Environment (TEE) Attestation
          </h1>
          <SubmitForm refetch={refetch} className="max-w-4xl mx-auto" />
        </div>
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-4">
            <HistoryChooser />
            <div className="flex items-center gap-4">
              <div className="text-sm text-pi2-purple-50">
                Auto-refresh in: <span className="font-medium">{secondsUntilRefresh}s</span>
              </div>
              <Button onClick={handleRefresh} disabled={isFetching}>
                <RefreshCw className={cn(`h-4 w-4 mr-2`, { "animate-spin": isFetching })} />
                Refresh
              </Button>
            </div>
          </div>
          <ValidationRecordsTable
            records={records}
            isLoading={isFetching}
            isPaging={isFetching}
            currentPage={currentPage}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={goToPage}
            userHistoryOnly={userHistoryOnly}
            address={address}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
