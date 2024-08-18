import type { PlayerLeaderboardResponseData } from "@/types/player";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type Props = {
  players: PlayerLeaderboardResponseData[];
};

export default function Component(props: Props): JSX.Element {
  return <DataTable columns={columns} data={props.players} />;
}
