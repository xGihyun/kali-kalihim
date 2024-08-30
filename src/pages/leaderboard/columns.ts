import type { PlayerLeaderboardResponseData } from "@/lib/types/player"
import type { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<PlayerLeaderboardResponseData>[] = [
  //{
  //  accessorKey: "userId",
  //  header: "ID",
  //  cell: () => {
  //    return "THISIS AN ID"
  //  }
  //},
  {
    id: "fullName",
    header: "Name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  },
  {
    accessorKey: "section.name",
    header: "Section",
    cell: ({row}) => {
      return `St. ${row.original.section.name}`
    }
  },
  {
    accessorKey: "rating",
    header: "Rating",
  },
]
