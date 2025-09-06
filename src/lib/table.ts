import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

export function useBasicTable<TData extends object>(params: {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  initialSorting?: SortingState;
  pageSize?: number;
}) {
  const { data, columns, initialSorting = [], pageSize = 20 } = params;
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const table = useReactTable({
    data: useMemo(() => data, [data]),
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "auto",
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
  });
  return table;
}

export type { ColumnDef };
