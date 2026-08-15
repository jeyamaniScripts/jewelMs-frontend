"use client";

import { useCallback, useState } from "react";

export function useTableController(defaultSortBy: string, defaultLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(defaultLimit);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearchState] = useState("");

  /** Clicking the same column flips direction; a new column starts ascending. */
  const toggleSort = useCallback((key: string) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === key) {
        setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return prevSortBy;
      }
      setOrder("asc");
      return key;
    });
    setPage(1); // changing sort resets to page 1 — the old page number may not exist in the new order
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  return { page, setPage, limit, setLimit, sortBy, order, toggleSort, search, setSearch };
}
