import clsx from "clsx";

export type GridConfigType = {
  grid: string;
  gap: string;
  padding: string;
  columns: string;
  rows: string;
  span?: string;
  tileClass?: string;
};

type ColumnsCount = 1 | 2 | 3 | 4;

const GRID_COLUMNS_STYLE: Record<ColumnsCount, string> = {
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
  if (peers === 1) {
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
  function getGridGap() {
    if (peers < 5) return "gap-4";
    if (peers < 13) return "gap-3";
    return "gap-2";
  }
  const grid = "grid place-content-center grid-flow-row";
  const gap = getGridGap();
  const padding = peers >= 10 && peers < 13 ? "xl:px-[140px]" : "";
  const columnsCount = getColumns(peers);
  const columns = GRID_COLUMNS_STYLE[columnsCount];
  const rows = peers == 2 ? "auto-rows-fr sm:grid-rows-[490px] 3xl:grid-rows-[520px]" : "auto-rows-fr";
  const span = peers > 1 ? "col-span-2" : "";
  const tileClass = TILE_CLASS[columnsCount];

  return { grid, gap, padding, columns, rows, span, tileClass };
}

export const getUnpinnedTilesGridStyle = (
  gridConfig: GridConfigType,
  isAnyTilePinned: boolean,
  horizontalRow: boolean,
  videoInVideo: boolean,
  fixedRatio: boolean
): string => {
  if (!isAnyTilePinned)
    return clsx(
      "h-full w-full",
      gridConfig.columns,
      gridConfig.grid,
      gridConfig.gap,
      gridConfig.padding,
      gridConfig.rows
    );

  if (fixedRatio)
    return clsx(
      "w-[400px]",
      videoInVideo
        ? "h-[220px] absolute bottom-4 right-4 z-10"
        : "h-full flex flex-wrap flex-col content-center justify-center"
    );

  const horizontal = horizontalRow ? "sm:flex-row" : "sm:flex-col";

  return `h-full w-full flex flex-col gap-y-3 ${horizontal} sm:gap-x-3 sm:justify-center`;
};
