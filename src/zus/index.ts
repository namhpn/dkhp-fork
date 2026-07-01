import { ColumnApi, GridApi } from 'ag-grid-community';
import { partition } from 'lodash';
import { memoize } from 'proxy-memoize';
import { Mutate, StoreApi, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ClassModel, ClassModelOriginal } from '../types';
import { calcTongSoTC, isSameAgGridRowId } from '../utils';
import {
  Bundle,
  ParseResult,
  RecommendationGroup,
  buildBundles,
  findBundleByCodes,
  findBundlesForCourse,
  generateRecommendations,
  getBaseCode,
  parseAndValidate,
} from '../manualInput';

type TkbStore = {
  dataExcel: {
    fileName: string;
    data: ClassModelOriginal[];
    /* @deprecated: use lastUpdateTimestamp instead (keep for backward compatibility) */
    lastUpdate?: string;
    lastUpdateTimestamp?: number;
  } | null;

  selectedClasses: ClassModel[];
  agGridColumnState: ReturnType<ColumnApi['getColumnState']> | null;
  agGridFilterModel: ReturnType<GridApi['getFilterModel']> | null;

  // Manual class-code mode for timetable/script output
  isChiVeTkb: boolean;
  textareaChiVeTkb: string;
  manualResolvedMaLop: string[];

  setDataExcel: (data: TkbStore['dataExcel']) => void;
  setSelectedClasses: (data: TkbStore['selectedClasses']) => void;
  removeClasses: (data: ClassModel[]) => void;
  setAgGridColumnState: (data: TkbStore['agGridColumnState']) => void;
  setAgGridFilterModel: (data: TkbStore['agGridFilterModel']) => void;
  setIsChiVeTkb: (data: TkbStore['isChiVeTkb']) => void;
  setTextareChiVeTkb: (data: TkbStore['textareaChiVeTkb']) => void;
  setManualResolvedMaLop: (codes: string[]) => void;
  clearManualResolvedMaLop: () => void;
};

export const useTkbStore = create<TkbStore>()(
  persist(
    (set, get) => ({
      dataExcel: null,

      selectedClasses: [], // [{}, {}]
      agGridColumnState: null,
      agGridFilterModel: null,

      isChiVeTkb: true,
      textareaChiVeTkb: '',
      manualResolvedMaLop: [],

      // TODO: move actions outside of store
      setDataExcel: (data) => {
        const newDataExcel = data?.data ?? [];
        const currentSelectedClasses = get().selectedClasses;
        // When the user uploads a new excel file:
        // - when it's a new semester, the AgGridRowId will be different => selectedClasses will be cleared
        // - when it's an updated excel file of the same semester, the AgGridRowId will be the same => keep selectedClasses
        const newSelectedClasses = newDataExcel.filter((newClass) =>
          currentSelectedClasses.some((selectedClass) => isSameAgGridRowId(selectedClass, newClass)),
        );
        // Clear filters when uploading a new excel file (but keep selections)
        set({ dataExcel: data, selectedClasses: newSelectedClasses, agGridFilterModel: null });
      },
      setSelectedClasses: (data) => {
        set({ selectedClasses: data });
      },
      removeClasses: (classesToRemove) => {
        set((state) => ({
          selectedClasses: state.selectedClasses.filter((selectedClass) =>
            classesToRemove.every((classToRemove) => !isSameAgGridRowId(selectedClass, classToRemove)),
          ),
        }));
      },
      setAgGridColumnState: (data) => {
        set({ agGridColumnState: data });
      },
      setAgGridFilterModel: (data) => {
        set({ agGridFilterModel: data });
      },
      setIsChiVeTkb: (data) => {
        set({ isChiVeTkb: data });
      },
      setTextareChiVeTkb: (data) => {
        set({ textareaChiVeTkb: data.toUpperCase(), manualResolvedMaLop: [] });
      },
      setManualResolvedMaLop: (codes) => {
        set({ manualResolvedMaLop: codes });
      },
      clearManualResolvedMaLop: () => {
        set({ manualResolvedMaLop: [] });
      },
    }),
    {
      name: 'tkb-state-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

type StoreWithPersist = Mutate<StoreApi<TkbStore>, [['zustand/persist', unknown]]>;
export const withStorageDOMEvents = (store: StoreWithPersist) => {
  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate();
    }
  };
  window.addEventListener('storage', storageEventCallback);
  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};
// sync state between tabs: https://github.com/pmndrs/zustand/issues/714
// TODO: more granular sync (only sync selectedClasses, not all state)
withStorageDOMEvents(useTkbStore);

export const selectDataExcel = (state: TkbStore) => state.dataExcel;
export const selectSelectedClasses = (state: TkbStore) => state.selectedClasses;
export const selectAgGridColumnState = (state: TkbStore) => state.agGridColumnState;
export const selectAgGridFilterModel = (state: TkbStore) => state.agGridFilterModel;
export const selectIsChiVeTkb = (state: TkbStore) =>
  state.isChiVeTkb || window.location.search.includes('self_selected'); // TODO: constant for self_selected

/**
 * Resolved MaLop codes loaded from URL (?self_selected=...).
 * These are used when a shared schedule is opened.
 */
export function getUrlResolvedMaLop(): string[] | null {
  const searchParams = new URLSearchParams(window.location.search);
  const val = searchParams.get('self_selected');
  if (!val) return null;
  return val
    .split(',')
    .filter(Boolean)
    .map((s) => s.toUpperCase().trim());
}

export const selectTextareaChiVeTkb = (state: TkbStore) => {
  // In manual mode with URL-resolved codes, show the codes in textarea
  // (on first load, state.textareaChiVeTkb is empty, so show URL codes)
  return state.textareaChiVeTkb;
};
export const selectFinalDataTkb = (state: TkbStore): ClassModel[] => {
  const dataExcel = selectDataExcel(state);
  return dataExcel?.data ?? [];
};
export const selectBundles = memoize((state: TkbStore): Bundle[] => {
  const finalDataTkb = selectFinalDataTkb(state);
  return buildBundles(finalDataTkb);
});

export const selectManualParseResult = memoize((state: TkbStore): ParseResult => {
  const textareaChiVeTkb = selectTextareaChiVeTkb(state);
  const finalDataTkb = selectFinalDataTkb(state);
  return parseAndValidate(textareaChiVeTkb, finalDataTkb);
});

export const selectManualRecommendations = memoize((state: TkbStore): RecommendationGroup[] => {
  const isChiVeTkb = selectIsChiVeTkb(state);
  if (!isChiVeTkb) return [];
  const parseResult = selectManualParseResult(state);
  const bundles = selectBundles(state);
  const finalDataTkb = selectFinalDataTkb(state);
  if (parseResult.errors.length > 0) return [];
  return generateRecommendations(parseResult.tokens, bundles, finalDataTkb);
});

export const selectSelectedClassesOutput = memoize((state: TkbStore): ClassModel[] => {
  const isChiVeTkb = selectIsChiVeTkb(state);
  const finalDataTkb = selectFinalDataTkb(state);

  if (!isChiVeTkb) {
    return selectSelectedClasses(state);
  }

  // Manual mode
  const parseResult = selectManualParseResult(state);
  const bundles = selectBundles(state);
  const storeResolved = state.manualResolvedMaLop;
  const resolvedCodes = new Set(storeResolved);

  // If no resolved codes, check for validation errors
  if (resolvedCodes.size === 0 && parseResult.errors.length > 0) return [];

  const rows: ClassModel[] = [];

  const autoResolvedCodes = new Set<string>();
  const explicitPracticesByBase = new Map<string, string>();

  for (const token of parseResult.tokens) {
    if (token.type === 'practiceClass') {
      explicitPracticesByBase.set(token.baseCode ?? getBaseCode(token.raw), token.raw);
    }
  }

  // Step 1: collect codes from exact explicit base+practice pairs and from
  // unambiguous baseClass tokens that have no practice variants.
  for (const token of parseResult.tokens) {
    if (token.type !== 'baseClass') continue;

    const explicitPractice = explicitPracticesByBase.get(token.raw);

    if (explicitPractice) {
      const exactBundle = findBundleByCodes([token.raw, explicitPractice], bundles);
      if (exactBundle && !exactBundle.hasInternalConflict) {
        exactBundle.codes.forEach((c) => autoResolvedCodes.add(c));
      }
      continue;
    }

    const candidates = bundles.filter((b) => b.baseCode === token.raw && !b.hasInternalConflict);
    if (candidates.length === 1 && candidates[0].codes.length === 1) {
      candidates[0].codes.forEach((c) => autoResolvedCodes.add(c));
    }
  }

  // Step 2: combine resolved codes (from URL/store) with auto-resolved codes
  const allResolved = new Set([...resolvedCodes, ...autoResolvedCodes]);

  // Step 3: if we have any resolved codes, use them
  if (allResolved.size > 0) {
    rows.push(...finalDataTkb.filter((it) => allResolved.has(it.MaLop)));
    return rows;
  }

  return rows;
});
export const selectTongSoTcSelected = (state: TkbStore) => calcTongSoTC(selectSelectedClasses(state));
export const selectTongSoTcOutput = (state: TkbStore) => calcTongSoTC(selectSelectedClassesOutput(state));
export const selectPhanLoaiHocTrenTruong = memoize((state: TkbStore): [ClassModel[], ClassModel[]] => {
  return partition(selectSelectedClassesOutput(state), { Thu: '*' });
});

export const selectManualResolvedMaLop = (state: TkbStore) => state.manualResolvedMaLop;

/**
 * Check if manual mode has any unresolved tokens (course IDs or base classes
 * with variants) that need the user to click a suggestion.
 */
export const selectHasUnresolvedTokens = memoize((state: TkbStore): boolean => {
  const isChiVeTkb = selectIsChiVeTkb(state);
  if (!isChiVeTkb) return false;
  const parseResult = selectManualParseResult(state);
  if (parseResult.errors.length > 0) return false;
  const bundles = selectBundles(state);
  const resolvedCodes = new Set(state.manualResolvedMaLop);

  const explicitPracticeBaseSet = new Set(
    parseResult.tokens
      .filter((token) => token.type === 'practiceClass')
      .map((token) => token.baseCode ?? getBaseCode(token.raw)),
  );

  const hasResolvedBundle = (candidateBundles: Bundle[]) => {
    return candidateBundles.some((bundle) => bundle.codes.every((code) => resolvedCodes.has(code)));
  };

  for (const token of parseResult.tokens) {
    if (token.type === 'courseId') {
      const candidates = findBundlesForCourse(token.raw, bundles).filter((bundle) => !bundle.hasInternalConflict);
      if (candidates.length > 0 && !hasResolvedBundle(candidates)) return true;
    }

    if (token.type === 'baseClass') {
      if (explicitPracticeBaseSet.has(token.raw)) continue;

      const candidates = bundles.filter((bundle) => bundle.baseCode === token.raw && !bundle.hasInternalConflict);
      const needsChoice = candidates.length > 1 || candidates.some((bundle) => bundle.codes.length > 1);
      if (needsChoice && !hasResolvedBundle(candidates)) return true;
    }
  }
  return false;
});

export const selectUnmatchedMaLop = memoize((state: TkbStore): string[] => {
  const isChiVeTkb = selectIsChiVeTkb(state);
  const textareaChiVeTkb = selectTextareaChiVeTkb(state);

  if (!isChiVeTkb || !textareaChiVeTkb.trim()) return [];

  const parseResult = selectManualParseResult(state);
  if (parseResult.errors.length === 0) return [];

  // Collect all distinct tokens that contributed to errors
  const errorTokens = [...new Set(parseResult.errors.map((e) => e.token))];
  return errorTokens;
});

export const selectManualParseErrorMessages = memoize((state: TkbStore): string[] => {
  const isChiVeTkb = selectIsChiVeTkb(state);
  const textareaChiVeTkb = selectTextareaChiVeTkb(state);

  if (!isChiVeTkb || !textareaChiVeTkb.trim()) return [];

  const parseResult = selectManualParseResult(state);
  if (parseResult.errors.length === 0) return [];

  return [...new Set(parseResult.errors.map((e) => `${e.token}: ${e.message}`))];
});
