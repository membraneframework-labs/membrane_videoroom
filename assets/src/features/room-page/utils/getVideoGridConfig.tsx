type GridConfigType = {
  grid: string;
  gap: string;
  padding: string;
  columns: string;
  rows: string;
  span?: string;
  tileClass?: string;
};

type ColumnsCount = 1 | 2 | 3 | 4;

const COLUMNS: Record<ColumnsCount, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-4",
  3: "grid-cols-1 sm:grid-cols-6",
  4: "grid-cols-1 sm:grid-cols-8",
};

const TILE_CLASS: Record<ColumnsCount, string> = {
  1: "",
  2: "video-tile-grid-2",
  3: "video-tile-grid-3",
  4: "video-tile-grid-4",
};

function getColumns(peers: number): ColumnsCount {
  if (peers == 1) {
    return 1;
  }
  if (peers > 1 && peers < 5) {
    return 2;
  }
  if (peers >= 5 && peers < 13) {
    return 3;
  }

  return 4;
}

export function getGridConfig(peers: number): GridConfigType {
  const grid = "grid place-content-center grid-flow-row";
  const gap = peers < 5 ? "gap-4" : peers < 13 ? "gap-3" : "gap-2";
  const padding = peers >= 10 && peers < 13 ? "xl:px-[140px]" : "";
  const columnsCount = getColumns(peers);
  const columns = COLUMNS[columnsCount];
  const rows = peers == 2 ? "auto-rows-fr sm:grid-rows-[490px] 3xl:grid-rows-[520px]" : "auto-rows-fr";
  const span = peers > 1 ? "col-span-2" : "";
  const tileClass = TILE_CLASS[columnsCount];

  return { grid, gap, padding, columns, rows, span, tileClass };
}
