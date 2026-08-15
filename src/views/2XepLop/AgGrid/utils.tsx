import {
  AgGridEvent,
  CellStyle,
  ColDef,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  GetContextMenuItemsParams,
  GetQuickFilterTextParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IRowNode,
  MenuItemDef,
  RowClickedEvent,
  SelectionChangedEvent,
  ValueGetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import sortBy from 'lodash/sortBy';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Buoi, ClassModel } from 'types';
import { useDebouncedCallback } from 'use-debounce';
import {
  findOverlapedClasses,
  getAgGridRowId,
  getBuoiFromTiet,
  getConflictMaLop,
  hasOverlapSchedule,
  isSameAgGridRowId,
  log,
} from '../../../utils';
import {
  selectAgGridColumnState,
  selectAgGridFilterModel,
  selectDataExcel,
  selectFinalDataTkb,
  selectSelectedClasses,
  useTkbStore,
} from '../../../zus';
import SelectionToggleCell, { GridSelectionContext } from './SelectionToggleCell';

type FormattedBuoiValid = 'Sáng' | 'Chiều' | 'Tối';
type FormattedBuoi = FormattedBuoiValid | '*';
const BUOI_FORMAT_MAP: Record<Buoi, FormattedBuoi> = {
  [Buoi.Sang]: 'Sáng',
  [Buoi.Chieu]: 'Chiều',
  [Buoi.Toi]: 'Tối',
  [Buoi.N_A]: '*',
} as const;

type FormattedThuBuoiValid = `Thứ ${number} ${FormattedBuoiValid}`;
type FormattedThuBuoi = FormattedThuBuoiValid | '*';
const THUBUOI_ORDER_PRIORITY: Record<FormattedThuBuoi, number> = {
  '*': 0,
  'Thứ 2 Sáng': 1,
  'Thứ 2 Chiều': 2,
  'Thứ 2 Tối': 3,
  'Thứ 3 Sáng': 4,
  'Thứ 3 Chiều': 5,
  'Thứ 3 Tối': 6,
  'Thứ 4 Sáng': 7,
  'Thứ 4 Chiều': 8,
  'Thứ 4 Tối': 9,
  'Thứ 5 Sáng': 10,
  'Thứ 5 Chiều': 11,
  'Thứ 5 Tối': 12,
  'Thứ 6 Sáng': 13,
  'Thứ 6 Chiều': 14,
  'Thứ 6 Tối': 15,
  'Thứ 7 Sáng': 16,
  'Thứ 7 Chiều': 17,
  'Thứ 7 Tối': 18,
} as const;

const HTGD_ORDER_PRIORITY: Record<ClassModel['HTGD'], number> = {
  LT: 1,
  HT1: 2,
  HT2: 3,
  ĐA: 4,
  TTTN: 5,
  KLTN: 6,
} as const;

const BOLD_CELL_STYLE: CellStyle = { fontWeight: 600 };

const QUICK_FILTER_FIELDS = new Set(['MonHoc', 'MaLop', 'TenGV']);

const getQuickFilterText = ({ colDef, value }: GetQuickFilterTextParams<ClassModel>): string => {
  const field = colDef.field;
  if (!field || !QUICK_FILTER_FIELDS.has(field)) return '';
  return value == null || value === '' ? '' : String(value);
};

// ── Multi-criteria search with ";" separator ──────────────────────────────
export const SEARCH_SEPARATOR = ';';

/** Parse search input into display-label tokens (trimmed, empties dropped). */
export function parseSearchTokens(input: string): string[] {
  return input
    .split(SEARCH_SEPARATOR)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Parse search input into lower-cased tokens for matching. */
export function parseSearchTokensLower(input: string): string[] {
  return parseSearchTokens(input).map((t) => t.toLowerCase());
}

/** Return searchable text values for a row (lower-cased). */
function getSearchableText(row: ClassModel): string[] {
  return [
    row.MaMH || row.TenMH ? `${row.MaMH} - ${row.TenMH}` : '',
    row.MaLop ?? '',
    row.TenGV ?? '',
  ].map((s) => s.toLowerCase());
}

/** Check if a row matches a single lower-cased token across searchable fields. */
export function rowMatchesToken(row: ClassModel, lowerToken: string): boolean {
  return getSearchableText(row).some((text) => text.includes(lowerToken));
}

/** Return the display label of the first matching token (input order wins), or null. */
export function getFirstMatchingTokenLabel(
  row: ClassModel,
  tokens: string[],
): string | null {
  const lowerTexts = getSearchableText(row);
  for (let i = 0; i < tokens.length; i++) {
    const lowerToken = tokens[i].toLowerCase();
    if (lowerTexts.some((text) => text.includes(lowerToken))) {
      return tokens[i]; // display label (original casing)
    }
  }
  return null;
}

/** Factory: create a hidden column definition for search-group row grouping. */
function createSearchGroupColumnDef(
  getTokens: () => string[],
): ColDef<ClassModel> {
  return {
    colId: 'searchGroup',
    headerName: 'Nhóm tìm kiếm',
    hide: true,
    suppressColumnsToolPanel: true,
    suppressFiltersToolPanel: true,
    valueGetter: ({ data }: ValueGetterParams<ClassModel, string | null>) => {
      try {
        if (!data) return null;
        return getFirstMatchingTokenLabel(data, getTokens());
      } catch {
        return null; // fortify: malformed row never breaks grid
      }
    },
    comparator: (a: string | null, b: string | null) => {
      const tokens = getTokens();
      const ia = a == null ? -1 : tokens.indexOf(a);
      const ib = b == null ? -1 : tokens.indexOf(b);
      return ia - ib; // input-order; unmatched filtered out anyway
    },
  };
}

/**
 * Encapsulates search-token parsing, external filter callbacks, and group-column
 * definition into a single cohesive unit. The caller only passes the returned
 * props to <AgGridReact> — never touches internals.
 */
export function useGridSearchGrouping(
  quickFilterText: string,
  columnApiRef: React.MutableRefObject<any>,
  agGridRef?: React.MutableRefObject<AgGridReact<ClassModel> | null>,
) {
  const tokens = useMemo(() => parseSearchTokens(quickFilterText), [quickFilterText]);

  const isExternalFilterPresent = useCallback(() => tokens.length > 0, [tokens]);

  const doesExternalFilterPass = useCallback(
    (params: { data?: ClassModel | null }) => {
      if (!params.data) return false;
      const lowerTokens = tokens.map((t) => t.toLowerCase());
      return lowerTokens.some((t) => rowMatchesToken(params.data!, t));
    },
    [tokens],
  );

  const searchGroupColDef = useMemo(
    () => createSearchGroupColumnDef(() => tokens),
    [tokens],
  );

  const searchAutoGroupColumnDef = useMemo(
    () => createAutoGroupColumnDef(() => tokens),
    [tokens],
  );

  // Toggle grouping on the synthetic searchGroup column
  useEffect(() => {
    const api = columnApiRef.current;
    if (!api?.setRowGroupColumns) return;
    try {
      api.setRowGroupColumns(tokens.length > 1 ? ['searchGroup'] : []);
    } catch (e) {
      log('searchGroup grouping failed', e);
    }
    if (tokens.length > 1) {
      const gridApi = agGridRef?.current?.api;
      if (gridApi?.forEachNode) {
        setTimeout(() => {
          try {
            gridApi.forEachNode((node) => {
              if (node.group) node.setExpanded(true);
            });
          } catch {}
        }, 0);
      }
    }
  }, [tokens, columnApiRef, agGridRef]);

  return { tokens, isExternalFilterPresent, doesExternalFilterPass, searchGroupColDef, searchAutoGroupColumnDef };
}

const buildColumnDefs = (): GridOptions['columnDefs'] => [
  {
    colId: 'action',
    headerName: '',
    width: 52,
    minWidth: 52,
    maxWidth: 52,
    pinned: 'left',
    sortable: false,
    filter: false,
    suppressMenu: true,
    suppressNavigable: true,
    lockPosition: true,
    cellRenderer: SelectionToggleCell,
  },
  {
    headerName: 'STT',
    field: 'STT',
    filter: false,
    hide: true,
  },
  {
    headerName: 'MÃ MH',
    field: 'MaMH',
    initialWidth: 100,
    hide: true,
  },
  {
    headerName: 'TÊN MÔN HỌC',
    field: 'TenMH',
    initialWidth: 280,
    cellStyle: BOLD_CELL_STYLE,
    enableRowGroup: true,
    hide: true,
  },
  {
    headerName: 'MÔN HỌC',
    field: 'MonHoc',
    flex: 1,
    minWidth: 200,
    cellStyle: BOLD_CELL_STYLE,
    enableRowGroup: true,
    valueGetter: ({ data }: ValueGetterParams<ClassModel, string>): string => {
      return data?.MaMH || data?.TenMH ? `${data.MaMH} - ${data.TenMH}` : '';
    },
  },
  {
    headerName: 'MÃ LỚP',
    field: 'MaLop',
    width: 160,
    minWidth: 120,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'MÃ GIẢNG VIÊN',
    field: 'MaGV',
    initialWidth: 150,
    filter: false,
    hide: true,
  },
  {
    headerName: 'TÊN GIẢNG VIÊN',
    field: 'TenGV',
    width: 180,
    minWidth: 140,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'THỨ+BUỔI',
    colId: 'ThuBuoi',
    initialWidth: 150,
    enableRowGroup: true,
    hide: true,
    valueGetter: ({ data }: ValueGetterParams<ClassModel, number>): FormattedThuBuoi => {
      if (!data?.Thu || data.Thu === '*') return '*';
      const buoi = getBuoiFromTiet(data.Tiet);
      return `Thứ ${parseInt(data.Thu)} ${BUOI_FORMAT_MAP[buoi]}` as FormattedThuBuoiValid;
    },
    comparator: (a, b) => {
      return THUBUOI_ORDER_PRIORITY[a] - THUBUOI_ORDER_PRIORITY[b];
    },
  },
  {
    headerName: 'THỨ',
    field: 'Thu',
    width: 72,
    minWidth: 64,
    cellStyle: BOLD_CELL_STYLE,
    enableRowGroup: true,
    comparator: (a: ClassModel['Thu'], b: ClassModel['Thu']) => {
      return a.localeCompare(b);
    },
  },
  {
    headerName: 'TIẾT',
    field: 'Tiet',
    width: 72,
    minWidth: 64,
    cellStyle: BOLD_CELL_STYLE,
    comparator: (tietA: ClassModel['Tiet'], tietB: ClassModel['Tiet']) => {
      const buoiA = getBuoiFromTiet(tietA);
      const buoiB = getBuoiFromTiet(tietB);
      if (buoiA === buoiB) {
        return tietA.localeCompare(tietB);
      }
      return buoiA - buoiB;
    },
  },
  {
    headerName: 'PHÒNG HỌC',
    field: 'PhongHoc',
    width: 110,
    minWidth: 90,
    filter: false,
  },
  {
    headerName: 'SỐ TC',
    field: 'SoTc',
    width: 72,
    minWidth: 64,
    filter: false,
  },
  {
    headerName: 'SỈ SỐ',
    field: 'SiSo',
    width: 72,
    minWidth: 64,
    filter: false,
  },
  {
    headerName: 'HTGD',
    field: 'HTGD',
    width: 72,
    minWidth: 64,
    comparator: (a: ClassModel['HTGD'], b: ClassModel['HTGD']) => {
      return HTGD_ORDER_PRIORITY[a] - HTGD_ORDER_PRIORITY[b];
    },
  },
  {
    headerName: 'NGÔN NGỮ',
    field: 'NgonNgu',
    width: 96,
    minWidth: 80,
  },
  {
    headerName: 'HỆ ĐT',
    field: 'HeDT',
    initialWidth: 90,
    hide: true,
  },
  {
    headerName: 'KHOA QL',
    field: 'KhoaQL',
    initialWidth: 120,
    enableRowGroup: true,
    hide: true,
  },
  {
    headerName: 'THỰC HÀNH',
    field: 'ThucHanh',
    initialWidth: 130,
    hide: true,
  },
  {
    headerName: 'CÁCH TUẦN',
    field: 'CachTuan',
    initialWidth: 125,
    filter: false,
    hide: true,
  },
  {
    headerName: 'KHÓA HỌC',
    field: 'KhoaHoc',
    initialWidth: 120,
    hide: true,
  },
  {
    headerName: 'HỌC KỲ',
    field: 'HocKy',
    initialWidth: 100,
    filter: false,
    hide: true,
  },
  {
    headerName: 'NĂM HỌC',
    field: 'NamHoc',
    initialWidth: 110,
    filter: false,
    hide: true,
  },
  {
    headerName: 'NBD',
    field: 'NBD',
    initialWidth: 110,
    filter: false,
    hide: true,
  },
  {
    headerName: 'NKT',
    field: 'NKT',
    initialWidth: 110,
    filter: false,
    hide: true,
  },
  {
    headerName: 'GHI CHÚ',
    field: 'GhiChu',
    hide: true,
  },
];

const defaultColDef: GridOptions['defaultColDef'] = {
  resizable: true,
  filter: true,
  floatingFilter: false,
  filterParams: { buttons: ['reset'], defaultToNothingSelected: true },
  menuTabs: ['generalMenuTab'],
  getQuickFilterText,
};

function createAutoGroupColumnDef(
  getTokens: () => string[],
): GridOptions['autoGroupColumnDef'] {
  return {
    sort: 'asc',
    width: 120,
    maxWidth: 180,
    comparator: (a: string | null, b: string | null) => {
      const tokens = getTokens();
      const ia = a == null ? -1 : tokens.indexOf(a);
      const ib = b == null ? -1 : tokens.indexOf(b);
      const aIsToken = ia !== -1;
      const bIsToken = ib !== -1;
      if (aIsToken || bIsToken) {
        if (aIsToken && bIsToken) return ia - ib;
        if (aIsToken) return -1;
        return 1;
      }
      const isGroupingByThuBuoi = a?.includes('Thứ') && b?.includes('Thứ');
      if (isGroupingByThuBuoi) {
        return THUBUOI_ORDER_PRIORITY[a as FormattedThuBuoi] - THUBUOI_ORDER_PRIORITY[b as FormattedThuBuoi];
      }
      const bothAreNumeral = a != null && b != null && /\d+/.test(a) && /\d+/.test(b);
      if (bothAreNumeral) return (a as unknown as number) - (b as unknown as number);
      return 0;
    },
  };
}

const getMainMenuItems: GridOptions['getMainMenuItems'] = () => {
  return ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll'];
};

const getRowId: GridOptions<ClassModel>['getRowId'] = ({ data }) => {
  return getAgGridRowId(data);
};

function getVisibleLeafCount(api: GridApi<ClassModel>) {
  let count = 0;
  api.forEachNodeAfterFilter((node) => {
    if (!node.group && node.data) count += 1;
  });
  return count;
}

function getContextMenuItemsBuilder() {
  type MenuItem = string | MenuItemDef;

  const menuItems: MenuItem[] = [];
  let numItemsInThisBlock = 0;

  const addToBlock = (...items: MenuItem[]) => {
    menuItems.push(...items);
    numItemsInThisBlock += items.length;
  };

  const endOfBlock = () => {
    if (numItemsInThisBlock) menuItems.push('separator');
    numItemsInThisBlock = 0;
  };

  const constructFinal = () => {
    while (menuItems.at(-1) === 'separator') menuItems.pop();
    return menuItems;
  };

  return { addToBlock, endOfBlock, constructFinal };
}

const PROGRAMMATICALLY_CHANGE_SELECTION = 'api';
export const useGridOptions = () => {
  const agGridRef = useRef<AgGridReact<ClassModel>>(null);
  const columnApiRef = useRef<any>(null);
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const setSelectedClasses = useTkbStore((s) => s.setSelectedClasses);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasActiveFilter, setHasActiveFilter] = useState(false);

  const { isExternalFilterPresent, doesExternalFilterPass, searchGroupColDef, searchAutoGroupColumnDef, tokens } =
    useGridSearchGrouping(quickFilterText, columnApiRef, agGridRef);

  const columnDefs = useMemo(() => {
    const base = buildColumnDefs() ?? [];
    return tokens.length > 1 ? [...base, searchGroupColDef] : base;
  }, [searchGroupColDef, tokens.length]);

  const isRowSelected = useCallback(
    (row: ClassModel) => selectedClasses.some((selected) => isSameAgGridRowId(selected, row)),
    [selectedClasses],
  );

  const getRowConflictMaLop = useCallback(
    (row: ClassModel) => getConflictMaLop(selectedClasses, row),
    [selectedClasses],
  );

  const refreshSelectionColumns = useCallback(() => {
    agGridRef.current?.api?.refreshCells({ columns: ['action'], force: true });
  }, []);

  const updateVisibleCount = useCallback(() => {
    const api = agGridRef.current?.api;
    if (!api) return;
    setVisibleCount(getVisibleLeafCount(api));
    setHasActiveFilter(api.isColumnFilterPresent() || isExternalFilterPresent());
  }, [isExternalFilterPresent]);

  const updateNodesSelectionToAgGrid = useCallback((nextSelectedClasses: ClassModel[]) => {
    if (!agGridRef.current?.api) return;
    const { api } = agGridRef.current;

    api.deselectAll(PROGRAMMATICALLY_CHANGE_SELECTION);

    const toSelectNodes: IRowNode<ClassModel>[] = [];
    api.forEachNode((node) => {
      if (node.data && nextSelectedClasses.find((it) => isSameAgGridRowId(it, node.data!))) {
        toSelectNodes.push(node);
      }
    });
    if (toSelectNodes.length) {
      api.setNodesSelected({ nodes: toSelectNodes, newValue: true, source: PROGRAMMATICALLY_CHANGE_SELECTION });
    }
  }, []);

  const onToggleRowSelection = useCallback(
    (row: ClassModel) => {
      if (isRowSelected(row)) {
        setSelectedClasses(selectedClasses.filter((selected) => !isSameAgGridRowId(selected, row)));
        return;
      }
      if (hasOverlapSchedule(selectedClasses, row)) return;
      setSelectedClasses([...selectedClasses, row]);
    },
    [isRowSelected, selectedClasses, setSelectedClasses],
  );

  const gridContext = useMemo<GridSelectionContext>(
    () => ({
      isRowSelected,
      getConflictMaLop: getRowConflictMaLop,
      onToggleRowSelection,
    }),
    [getRowConflictMaLop, isRowSelected, onToggleRowSelection],
  );

  const onSelectionChanged = useCallback(
    ({ source, api }: SelectionChangedEvent<ClassModel>) => {
      if (source === PROGRAMMATICALLY_CHANGE_SELECTION) return;

      const oldSelectedClasses = selectedClasses;
      const newSelectedClasses = api.getSelectedRows();

      const isRemoving = newSelectedClasses.length < oldSelectedClasses.length;
      if (isRemoving) {
        setSelectedClasses(newSelectedClasses);
        return;
      }

      const { kept: finalSelectedClasses } = findOverlapedClasses(oldSelectedClasses.concat(newSelectedClasses));
      setSelectedClasses(finalSelectedClasses);
      updateNodesSelectionToAgGrid(finalSelectedClasses);
    },
    [selectedClasses, setSelectedClasses, updateNodesSelectionToAgGrid],
  );

  const DEBOUNCE_TIME = 500;
  const setAgGridFilterModel = useTkbStore((s) => s.setAgGridFilterModel);
  const setAgGridColumnState = useTkbStore((s) => s.setAgGridColumnState);
  const onFilterChanged: GridOptions['onFilterChanged'] = useDebouncedCallback((e: FilterChangedEvent) => {
    log('>>onFilterChanged', e);
    setAgGridFilterModel(e.api.getFilterModel());
    updateVisibleCount();
  }, DEBOUNCE_TIME);

  const onColumnChanged = useDebouncedCallback(({ columnApi }: AgGridEvent) => {
    log('>>onColumnChanged');
    setAgGridColumnState(columnApi.getColumnState());
  }, DEBOUNCE_TIME);

  const agGridFilterModel = useTkbStore(selectAgGridFilterModel);
  const agGridColumnState = useTkbStore(selectAgGridColumnState);
  const onGridReady = useCallback(
    ({ api, columnApi }: GridReadyEvent<ClassModel, any>) => {
      columnApiRef.current = columnApi;
      if (agGridColumnState?.length) {
        const sanitizedColumnState = agGridColumnState.filter(
          (column) => column.colId !== 'TrangThai' && column.colId !== 'searchGroup',
        );
        columnApi.applyColumnState({ state: sanitizedColumnState });
      }
      if (agGridFilterModel && Object.keys(agGridFilterModel).length) {
        api.setFilterModel(agGridFilterModel);
      }
      if (selectedClasses.length) {
        updateNodesSelectionToAgGrid(selectedClasses);
      }
      const tokens = parseSearchTokens(quickFilterText);
      if (tokens.length > 1) {
        try {
          columnApi.setRowGroupColumns(['searchGroup']);
        } catch (e) {
          log('searchGroup grouping failed', e);
        }
        setTimeout(() => {
          try {
            api.forEachNode((node) => {
              if (node.group) node.setExpanded(true);
            });
          } catch {}
        }, 0);
      } else {
        try {
          const currentGroups = columnApi.getRowGroupColumns().map((c: any) => c.getColId());
          if (currentGroups.includes('searchGroup')) {
            columnApi.setRowGroupColumns(currentGroups.filter((id: string) => id !== 'searchGroup'));
          }
        } catch {}
      }
      if (quickFilterText) {
        api.onFilterChanged();
      }
      updateVisibleCount();
    },
    [agGridColumnState, agGridFilterModel, quickFilterText, selectedClasses, updateNodesSelectionToAgGrid, updateVisibleCount],
  );

  const onFirstDataRendered = useCallback(
    ({ api, columnApi }: FirstDataRenderedEvent) => {
      if (agGridColumnState?.length) return;
      columnApi.autoSizeColumns(['MonHoc'], false);
    },
    [agGridColumnState],
  );

  const onRowClicked = useCallback(({ node }: RowClickedEvent<ClassModel>) => {
    if (node.group) {
      node.setExpanded(!node.expanded);
    }
  }, []);

  const onQuickFilterChange = useCallback((value: string) => {
    setQuickFilterText(value);
    agGridRef.current?.api?.onFilterChanged();
  }, []);

  const getContextMenuItems = useCallback(
    ({ value, column, api, columnApi }: GetContextMenuItemsParams<ClassModel>): (string | MenuItemDef)[] => {
      const { addToBlock, endOfBlock, constructFinal } = getContextMenuItemsBuilder();
      const headerName = column?.getColDef().headerName;

      if (value) {
        addToBlock({
          name: `Sao chép "${value}"`,
          action: () => {
            navigator.clipboard.writeText(value);
          },
        });
      }
      endOfBlock();

      if (value && column?.isFilterAllowed()) {
        const thisColumnCurrentFilterModel = api.getFilterModel()[column.getColId()];
        const alreadyFilterByThisValue =
          thisColumnCurrentFilterModel?.filter === value || thisColumnCurrentFilterModel?.values?.includes(value);
        if (!alreadyFilterByThisValue) {
          addToBlock({
            name: `Lọc "${headerName}"="${value}"`,
            action: () => {
              api.setFilterModel({
                ...api.getFilterModel(),
                [column.getColId()]: {
                  type: 'contains',
                  filter: value,
                  values: [value],
                },
              });
            },
          });
        }
      }
      if (column?.isFilterAllowed() && api.isColumnFilterPresent()) {
        const { [column.getColId()]: thisColumnFilterModel, ...otherColumnsFilterModel } = api.getFilterModel();
        if (thisColumnFilterModel) {
          addToBlock({
            name: `Xóa lọc "${headerName}"`,
            action: () => {
              api.setFilterModel({
                ...api.getFilterModel(),
                [column.getColId()]: null,
              });
            },
          });
        }
        if (thisColumnFilterModel && Object.keys(otherColumnsFilterModel).length) {
          addToBlock({
            name: `Xóa lọc khác ngoài "${headerName}"`,
            action: () => {
              api.setFilterModel({
                [column.getColId()]: api.getFilterModel()[column.getColId()],
              });
            },
          });
        }
      }
      if (api.isColumnFilterPresent()) {
        addToBlock({
          name: 'Xóa tất cả bộ lọc',
          action: () => {
            api.setFilterModel(null);
          },
        });
      }
      endOfBlock();

      addToBlock('resetColumns', 'autoSizeAll');
      endOfBlock();

      if (columnApi.getRowGroupColumns().length) {
        addToBlock('expandAll', 'contractAll');
      }
      endOfBlock();

      return constructFinal();
    },
    [],
  );

  const dataTkb = useTkbStore(selectFinalDataTkb);
  const rowData: GridOptions['rowData'] = useMemo(() => {
    return sortBy(dataTkb, ['KhoaQL', 'MaLop', 'Thu', 'Tiet']);
  }, [dataTkb]);

  const totalCount = rowData?.length ?? 0;
  const hasNoVisibleRows = totalCount > 0 && visibleCount === 0 && hasActiveFilter;

  const dataExcel = useTkbStore(selectDataExcel);
  const prevLastUpdateRef = useRef<number | string | undefined>(undefined);
  useEffect(() => {
    if (!agGridRef.current?.api || !dataExcel?.fileName) return;

    const currentValue = dataExcel.lastUpdateTimestamp ?? dataExcel.lastUpdate;

    if (!currentValue) return;
    if (prevLastUpdateRef.current === currentValue) return;
    prevLastUpdateRef.current = currentValue;

    const currentFilterModel = agGridRef.current.api.getFilterModel();
    if (currentFilterModel && Object.keys(currentFilterModel).length > 0) {
      agGridRef.current.api.setFilterModel(null);
    }
  }, [dataExcel?.lastUpdateTimestamp, dataExcel?.lastUpdate, dataExcel?.fileName]);

  useEffect(() => {
    const gridLength = agGridRef.current?.api?.getSelectedRows().length;
    const stateLength = selectedClasses.length;
    if (gridLength !== stateLength) {
      log('>>useEffect: selectedClasses changed');
      updateNodesSelectionToAgGrid(selectedClasses);
    }
    refreshSelectionColumns();
  }, [selectedClasses, updateNodesSelectionToAgGrid, refreshSelectionColumns]);

  useEffect(() => {
    updateVisibleCount();
  }, [rowData, updateVisibleCount]);

  // Re-count after AG Grid re-evaluates external filter with new tokens
  useEffect(() => {
    updateVisibleCount();
  }, [isExternalFilterPresent, doesExternalFilterPass, updateVisibleCount]);

  const isRowSelectable = useCallback(
    (node: IRowNode<ClassModel>): boolean => {
      return !!node.data && !hasOverlapSchedule(selectedClasses, node.data);
    },
    [selectedClasses],
  );

  useEffect(() => {
    agGridRef.current?.api?.forEachLeafNode((node) => {
      const oldSelectable = node.selectable;
      const newSelectable = isRowSelectable(node);
      if (oldSelectable === newSelectable) return;

      // @ts-ignore
      node.setRowSelectable(isRowSelectable(node));
    });
    refreshSelectionColumns();
  }, [selectedClasses, isRowSelectable, refreshSelectionColumns]);

  return {
    agGridRef,
    isRowSelectable,
    columnDefs,
    defaultColDef,
    autoGroupColumnDef: searchAutoGroupColumnDef,
    getMainMenuItems,
    getContextMenuItems,
    onSelectionChanged,
    onFilterChanged,
    onColumnChanged,
    onGridReady,
    onFirstDataRendered,
    onRowClicked,
    rowData,
    getRowId,
    gridContext,
    quickFilterText,
    onQuickFilterChange,
    visibleCount,
    totalCount,
    hasNoVisibleRows,
    isExternalFilterPresent,
    doesExternalFilterPass,
  };
};