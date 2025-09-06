import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
  const table = useReactTable({
    data: useMemo(() => data, [data]),
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
  });
  return table;
}

export type { ColumnDef };

