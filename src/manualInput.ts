/**
 * Manual input parser, class bundler, and recommendation engine.
 *
 * This module provides pure utility functions for:
 * - Parsing user-entered class codes / course IDs
 * - Building class "bundles" from imported timetable data
 * - Generating non-overlapping schedule recommendations
 */

import { ClassModel } from './types';
import { findOverlapedClasses, getDanhSachTiet } from './utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedToken {
  raw: string;
  type: 'courseId' | 'baseClass' | 'practiceClass';
  /** Base theory class for practiceClass tokens, e.g. IT003.O22 for IT003.O22.1. */
  baseCode?: string;
}

export interface ParseError {
  token: string;
  message: string;
}

export interface ParseResult {
  tokens: ParsedToken[];
  errors: ParseError[];
}

/**
 * A "bundle" is a group of MaLop codes that should be taken together.
 *
 * Example: EC201.Q21 with variant .1 → codes = [EC201.Q21, EC201.Q21.1]
 *          EC204.Q22 with no variants → codes = [EC204.Q22]
 */
export interface Bundle {
  baseCode: string;
  codes: string[];
  /** All timetable rows matching this bundle's MaLop codes. Precomputed to avoid scanning allClasses repeatedly. */
  rows: ClassModel[];
  /** Occupied timetable slots for fast conflict checks. Thu='*' contributes no slots. */
  slotKeys: string[];
  /** True when rows inside the bundle already conflict with each other. */
  hasInternalConflict: boolean;
  /** Lower values are preferred. Base-only bundles use 0; .1 uses 1; .2 uses 2; string suffixes use a larger rank. */
  variantRank: number;
  /** Penalty for standalone multi-part class codes such as IT003.O21.TTNT; lower is preferred. */
  standaloneSuffixPenalty: number;
  /** Stable order from imported data / bundle construction. */
  originalIndex: number;
}

/**
 * A recommendation combines locked bundles (from explicit fixed class codes)
 * with chosen bundles for unresolved course IDs, validated for no schedule overlap.
 */
export interface RecommendationGroup {
  /** All bundles in this recommendation (locked + chosen) */
  bundles: Bundle[];
  /** Course IDs that were resolved via chosen bundles */
  resolvedCourseIds: string[];
  /** Course IDs that could not be resolved */
  missingCourseIds: string[];
  /** All timetable rows expanded from all bundles */
  rows: ClassModel[];
}

// ---------------------------------------------------------------------------
// Tokenisation & parsing
// ---------------------------------------------------------------------------

/**
 * Split raw input text into tokens using whitespace, `+`, or comma as separators.
 * Each token is uppercased and trimmed.
 */
export function tokenise(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split(/\s+|\+|,/)
    .filter(Boolean)
    .map((t) => t.toUpperCase().trim());
}

/**
 * Classify a single token syntactically. Data-aware classification is handled
 * by classifyTokenWithData because dot-count alone cannot distinguish
 * standalone multi-part MonHoc codes from ThucHanh practice variants.
 */
export function classifyToken(raw: string): ParsedToken {
  return raw.includes('.') ? { raw, type: 'baseClass' } : { raw, type: 'courseId' };
}

/**
 * Classify a token against imported timetable data.
 *
 * Known ThucHanh variants are first-class practiceClass tokens. Known
 * non-variant MaLop values, including multi-part MonHoc codes such as
 * IT003.O22.CNVN, remain baseClass tokens. Unknown dotful values are left as
 * baseClass so validation can report "Không tìm thấy mã lớp".
 */
function classifyTokenWithData(raw: string, allMaLopSet: Set<string>, thucHanhMap: Map<string, number>): ParsedToken {
  if (!raw.includes('.')) return { raw, type: 'courseId' };

  if (allMaLopSet.has(raw) && isThucHanhVariant(raw, thucHanhMap)) {
    return { raw, type: 'practiceClass', baseCode: getBaseCode(raw) };
  }

  return { raw, type: 'baseClass' };
}

/**
 * Build a map from each unique MaLop to its ThucHanh value.
 */
function buildThucHanhMap(allClasses: ClassModel[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of allClasses) {
    if (!map.has(c.MaLop)) {
      map.set(c.MaLop, c.ThucHanh);
    }
  }
  return map;
}

/**
 * Check whether a suffixed MaLop (>1 dot) is a genuine ThucHanh variant
 * of its base (i.e., they have different `ThucHanh` values).
 */
function isThucHanhVariant(maLop: string, thucHanhMap: Map<string, number>): boolean {
  const base = getBaseCode(maLop);
  if (base === maLop) return false;
  const baseTh = thucHanhMap.get(base);
  const variantTh = thucHanhMap.get(maLop);
  return baseTh !== undefined && variantTh !== undefined && baseTh !== variantTh;
}

/**
 * Parse and validate tokens against the known class data.
 *
 * Token classification is data-aware:
 *   - No dot → courseId
 *   - Known MaLop that differs in ThucHanh from its base → practiceClass
 *   - Other dotful values → baseClass, including standalone multi-part MonHoc
 *
 * Validation rules:
 * - Explicit practiceClass tokens must be paired with their matching baseClass.
 * - A baseClass can be paired with at most one practiceClass.
 * - Duplicate-course mixed input (same course as both courseId and class token) is rejected.
 * - Unknown tokens that don't match any MaLop or course prefix are reported.
 *
 * Returns both valid tokens and a list of errors.
 */
export function parseAndValidate(input: string, allClasses: ClassModel[]): ParseResult {
  const rawTokens = tokenise(input);
  if (rawTokens.length === 0) return { tokens: [], errors: [] };

  const allMaLop = getAllMaLop(allClasses);
  const knownMaLopSet = new Set(allMaLop);
  const thucHanhMap = buildThucHanhMap(allClasses);

  const tokens: ParsedToken[] = rawTokens.map((raw) => classifyTokenWithData(raw, knownMaLopSet, thucHanhMap));

  const errors: ParseError[] = [];
  const invalidTokens = new Set<string>();

  const knownCourseIdSet = new Set(allMaLop.map((m) => getCourseId(m)).filter(Boolean));

  // Check 1: duplicate-course mixed input. A practiceClass is still a concrete
  // class token, so it conflicts with an explicit course-only token for the
  // same course.
  const courseIdTokens = tokens.filter((t) => t.type === 'courseId').map((t) => t.raw);
  const classTokens = tokens.filter((t) => t.type === 'baseClass' || t.type === 'practiceClass');

  const courseIdSet = new Set(courseIdTokens);
  const duplicateCourseIds = new Set<string>();
  for (const ct of classTokens) {
    const cid = getCourseId(ct.raw);
    if (cid && courseIdSet.has(cid)) {
      duplicateCourseIds.add(cid);
      invalidTokens.add(ct.raw);
      errors.push({
        token: ct.raw,
        message: `Vừa nhập môn (${cid}) vừa nhập lớp (${ct.raw})`,
      });
    }
  }
  for (const cid of duplicateCourseIds) {
    invalidTokens.add(cid);
    errors.push({
      token: cid,
      message: `Vừa nhập môn (${cid}) vừa nhập lớp`,
    });
  }

  // Check 2: unknown tokens.
  for (const t of tokens) {
    if (t.type === 'courseId') {
      if (!knownCourseIdSet.has(t.raw)) {
        invalidTokens.add(t.raw);
        errors.push({
          token: t.raw,
          message: 'Không tìm thấy mã môn học',
        });
      }
    } else if (t.type === 'baseClass') {
      if (!knownMaLopSet.has(t.raw)) {
        invalidTokens.add(t.raw);
        errors.push({
          token: t.raw,
          message: 'Không tìm thấy mã lớp',
        });
      }
    } else if (t.type === 'practiceClass') {
      if (!knownMaLopSet.has(t.raw)) {
        invalidTokens.add(t.raw);
        errors.push({
          token: t.raw,
          message: 'Không tìm thấy mã lớp thực hành',
        });
      }
    }
  }

  // Check 3: practice classes must be explicit, exact companions of a typed
  // base class, and there can only be one practice choice for each base.
  const baseClassSet = new Set(
    tokens.filter((t) => t.type === 'baseClass' && knownMaLopSet.has(t.raw)).map((t) => t.raw),
  );
  const practicesByBase = new Map<string, ParsedToken[]>();

  for (const t of tokens) {
    if (t.type !== 'practiceClass') continue;

    const baseCode = t.baseCode ?? getBaseCode(t.raw);

    if (!baseClassSet.has(baseCode)) {
      invalidTokens.add(t.raw);
      errors.push({
        token: t.raw,
        message: `Thiếu lớp lý thuyết ${baseCode} cho ${t.raw}`,
      });
      continue;
    }

    const existing = practicesByBase.get(baseCode) ?? [];
    existing.push(t);
    practicesByBase.set(baseCode, existing);
  }

  for (const [baseCode, practices] of practicesByBase) {
    if (practices.length <= 1) continue;

    for (const practice of practices) {
      invalidTokens.add(practice.raw);
      errors.push({
        token: practice.raw,
        message: `Chỉ chọn một lớp thực hành cho ${baseCode}`,
      });
    }
  }

  const validTokens = tokens.filter((t) => !invalidTokens.has(t.raw));

  return { tokens: validTokens, errors };
}

// ---------------------------------------------------------------------------
// Course / class code helpers
// ---------------------------------------------------------------------------

/** Extract course ID from a class code: part before the first dot. */
export function getCourseId(classCode: string): string {
  const dotIdx = classCode.indexOf('.');
  return dotIdx === -1 ? classCode : classCode.substring(0, dotIdx);
}

/** Extract the base class portion (everything up to the last dot). */
export function getBaseCode(maLop: string): string {
  const lastDot = maLop.lastIndexOf('.');
  return lastDot === -1 ? maLop : maLop.substring(0, lastDot);
}

/** Get the suffix after the last dot. */
export function getSuffix(maLop: string): string {
  const lastDot = maLop.lastIndexOf('.');
  return lastDot === -1 ? '' : maLop.substring(lastDot + 1);
}

// ---------------------------------------------------------------------------
// Bundle building
// ---------------------------------------------------------------------------

/**
 * Build class bundles from all timetable rows.
 *
 * A "bundle" groups a base class code with its ThucHanh-practice variant(s).
 * A suffixed code (more than one dot) is only treated as a variant if its
 * `ThucHanh` value differs from the base's `ThucHanh`. If they share the
 * same `ThucHanh`, the suffixed code is treated as a standalone base class
 * (e.g. `IT002.021.CNVN` is a separate class, not a variant of `IT002.021`).
 *
 * For each base class code:
 *   - If ThucHanh variants exist (baseCode + '.' + suffix with different ThucHanh),
 *     create one bundle per variant: [base, variant]
 *   - If no ThucHanh variants exist, create: [base]
 *
 * Variant bundles are sorted by suffix priority:
 *   numeric suffixes first (1, 2, …), then string order, then stable data order.
 */
export function buildBundles(allClasses: ClassModel[]): Bundle[] {
  const allMaLop = getAllMaLop(allClasses);
  const allMaLopSet = new Set(allMaLop);
  const thucHanhMap = buildThucHanhMap(allClasses);
  const rowsByMaLop = buildRowsByMaLop(allClasses);

  // Categorise all MaLop without depending on iteration order. The previous
  // implementation only recognised a variant if the base had already been seen.
  const baseSet = new Set<string>();
  const variantMap = new Map<string, string[]>();

  for (const maLop of allMaLop) {
    const dotCount = (maLop.match(/\./g) || []).length;

    if (dotCount === 1) {
      baseSet.add(maLop);
      continue;
    }

    if (dotCount > 1) {
      const base = getBaseCode(maLop);
      const baseTh = thucHanhMap.get(base);
      const variantTh = thucHanhMap.get(maLop);
      const isVariant =
        allMaLopSet.has(base) && baseTh !== undefined && variantTh !== undefined && baseTh !== variantTh;

      if (isVariant) {
        if (!variantMap.has(base)) variantMap.set(base, []);
        variantMap.get(base)!.push(maLop);
      } else {
        // Not a ThucHanh variant → treat as its own standalone base
        baseSet.add(maLop);
      }
    }
  }

  const bundles: Bundle[] = [];

  for (const baseCode of baseSet) {
    const variants = variantMap.get(baseCode);
    if (variants && variants.length > 0) {
      const sorted = [...variants].sort(compareVariantCodes);
      for (const variant of sorted) {
        bundles.push(createBundle(baseCode, [baseCode, variant], rowsByMaLop, bundles.length));
      }
    } else {
      bundles.push(createBundle(baseCode, [baseCode], rowsByMaLop, bundles.length));
    }
  }

  return bundles;
}

function buildRowsByMaLop(allClasses: ClassModel[]): Map<string, ClassModel[]> {
  const rowsByMaLop = new Map<string, ClassModel[]>();
  for (const row of allClasses) {
    const rows = rowsByMaLop.get(row.MaLop);
    if (rows) rows.push(row);
    else rowsByMaLop.set(row.MaLop, [row]);
  }
  return rowsByMaLop;
}

function createBundle(
  baseCode: string,
  codes: string[],
  rowsByMaLop: Map<string, ClassModel[]>,
  originalIndex: number,
): Bundle {
  const rows = codes.flatMap((code) => rowsByMaLop.get(code) ?? []);
  return {
    baseCode,
    codes,
    rows,
    slotKeys: getSlotKeysForRows(rows),
    hasInternalConflict: hasRowsInternalConflict(rows),
    variantRank: codes.length > 1 ? getVariantRank(codes[1]) : 0,
    standaloneSuffixPenalty: getStandaloneSuffixPenalty(baseCode),
    originalIndex,
  };
}

function getStandaloneSuffixPenalty(baseCode: string): number {
  // Some classes are represented as standalone, multi-part MaLop values
  // such as IT003.O21.TTNT or IT003.O21.CTVN. They are valid options,
  // but they should appear after simpler class codes like IT003.O21 when
  // coverage is otherwise equal. This penalty only applies when the
  // multi-part code is the bundle base; practice bundles like
  // EC201.Q21 + EC201.Q21.1 keep the baseCode EC201.Q21 and are not penalized.
  const dotCount = (baseCode.match(/\./g) || []).length;
  return dotCount > 1 ? 1 : 0;
}

function compareVariantCodes(a: string, b: string): number {
  const rankA = getVariantRank(a);
  const rankB = getVariantRank(b);
  if (rankA !== rankB) return rankA - rankB;
  return a.localeCompare(b);
}

function getVariantRank(maLop: string): number {
  const suffix = getSuffix(maLop);
  const numeric = parseInt(suffix, 10);
  if (!isNaN(numeric)) return numeric;
  return 1000 + suffix.charCodeAt(0);
}

function getSlotKeysForRows(rows: ClassModel[]): string[] {
  const slotKeys = new Set<string>();
  for (const row of rows) {
    if (row.Thu === '*') continue;
    for (const tiet of getDanhSachTiet(row.Tiet)) {
      if (tiet === '*') continue;
      slotKeys.add(`${row.Thu}-${tiet}`);
    }
  }
  return [...slotKeys];
}

function hasRowsInternalConflict(rows: ClassModel[]): boolean {
  // This runs once per bundle, not inside recommendation search.
  return findOverlapedClasses(rows).redundant.length > 0;
}

function hasSlotConflict(slotKeysA: readonly string[], slotKeysB: readonly string[]): boolean {
  if (slotKeysA.length === 0 || slotKeysB.length === 0) return false;
  const smaller = slotKeysA.length <= slotKeysB.length ? slotKeysA : slotKeysB;
  const larger = slotKeysA.length <= slotKeysB.length ? new Set(slotKeysB) : new Set(slotKeysA);
  return smaller.some((slot) => larger.has(slot));
}

function mergeSlotKeys(slotKeysA: readonly string[], slotKeysB: readonly string[]): string[] {
  if (slotKeysA.length === 0) return [...slotKeysB];
  if (slotKeysB.length === 0) return [...slotKeysA];
  return [...new Set([...slotKeysA, ...slotKeysB])];
}

/**
 * Expand a bundle to all matching timetable rows.
 * One MaLop can have multiple rows when a class meets multiple times per week.
 */
export function expandBundle(bundle: Bundle, _allClasses: ClassModel[]): ClassModel[] {
  return bundle.rows;
}

/**
 * Get all unique MaLop values from class data.
 */
export function getAllMaLop(allClasses: ClassModel[]): string[] {
  return [...new Set(allClasses.map((c) => c.MaLop))];
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Find bundles whose base code has exactly one dot and matches the given
 * course ID (i.e., courseId === getCourseId(baseCode)).
 */
export function findBundlesForCourse(courseId: string, bundles: Bundle[]): Bundle[] {
  return bundles.filter((b) => getCourseId(b.baseCode) === courseId);
}

/**
 * Find a bundle by exact base code match.
 */
export function findBundleByBaseCode(baseCode: string, bundles: Bundle[]): Bundle | undefined {
  return bundles.find((b) => b.baseCode === baseCode);
}

/**
 * Find a bundle whose codes exactly match the given set (for resolution).
 */
export function findBundleByCodes(codes: string[], bundles: Bundle[]): Bundle | undefined {
  const sorted = [...codes].sort();
  return bundles.find((b) => {
    const bs = [...b.codes].sort();
    return bs.length === sorted.length && bs.every((v, i) => v === sorted[i]);
  });
}

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

/**
 * Generate non-overlapping schedule recommendations from parsed tokens.
 *
 * Algorithm:
 * 1. Identify "locked" bundles from explicit fixed baseClass tokens that
 *    have no variant ambiguity (base class with no variants).
 * 2. If locked bundles conflict internally, return empty (no valid groups).
 * 3. For each unresolved token (course ID or base class with variants),
 *    find candidate bundles.
 * 4. Search combinations left-to-right; validate no overlap via findOverlapedClasses.
 * 5. Allow partial groups (not all tokens need resolution).
 * 6. Rank: most resolved tokens first, lower suffix priority, stable order.
 * 7. Limit to top 10.
 *
 * For a single course ID, this naturally produces a list of available bundles.
 * For a single base class with variants, it produces variant bundle choices.
 */
export function generateRecommendations(
  tokens: ParsedToken[],
  bundles: Bundle[],
  _allClasses: ClassModel[],
): RecommendationGroup[] {
  if (tokens.length === 0) return [];
  if (bundles.length === 0) return [];

  const { lockedBundles, unresolvedTokens } = resolveManualTokens(tokens, bundles);

  const lockedState = createInitialSearchState(
    lockedBundles,
    unresolvedTokens.map((it) => it.key),
  );
  if (!lockedState) return [];

  if (unresolvedTokens.length === 0) {
    return [searchStateToRecommendation(lockedState)];
  }

  const MAX_RECOMMENDATIONS = 10;
  const BEAM_WIDTH = 50;

  let states: SearchState[] = [lockedState];

  for (const unresolved of unresolvedTokens) {
    const nextStates: SearchState[] = [];

    for (const state of states) {
      // Partial groups are useful: keep a skip branch, but never let the
      // number of retained states grow without bound.
      nextStates.push(markMissing(state, unresolved.key));

      for (const candidate of unresolved.candidates) {
        const next = tryAddBundle(state, candidate, unresolved.key);
        if (next) nextStates.push(next);
      }
    }

    states = rankAndDedupeStates(nextStates).slice(0, BEAM_WIDTH);
  }

  return rankAndDedupeStates(states)
    .filter((state) => state.bundles.length > lockedBundles.length)
    .slice(0, MAX_RECOMMENDATIONS)
    .map(searchStateToRecommendation);
}

type UnresolvedToken = { key: string; candidates: Bundle[] };

type SearchState = {
  bundles: Bundle[];
  resolvedCourseIds: string[];
  missingCourseIds: string[];
  rows: ClassModel[];
  slotKeys: string[];
  coveredCount: number;
  variantRankSum: number;
  standaloneSuffixPenaltySum: number;
  originalIndexSum: number;
};

function resolveManualTokens(
  tokens: ParsedToken[],
  bundles: Bundle[],
): { lockedBundles: Bundle[]; unresolvedTokens: UnresolvedToken[] } {
  const lockedBundles: Bundle[] = [];
  const lockedBundleKeys = new Set<string>();
  const unresolvedTokens: UnresolvedToken[] = [];

  const explicitPracticesByBase = new Map<string, string>();
  for (const token of tokens) {
    if (token.type === 'practiceClass') {
      explicitPracticesByBase.set(token.baseCode ?? getBaseCode(token.raw), token.raw);
    }
  }

  const addLockedBundle = (bundle: Bundle) => {
    const key = bundle.codes.slice().sort().join('|');
    if (lockedBundleKeys.has(key)) return;
    lockedBundleKeys.add(key);
    lockedBundles.push(bundle);
  };

  for (const token of tokens) {
    if (token.type === 'baseClass') {
      const explicitPractice = explicitPracticesByBase.get(token.raw);

      if (explicitPractice) {
        const exactBundle = findBundleByCodes([token.raw, explicitPractice], bundles);
        if (exactBundle && !exactBundle.hasInternalConflict) {
          addLockedBundle(exactBundle);
        }
        continue;
      }

      const candidates = bundles.filter((b) => b.baseCode === token.raw && !b.hasInternalConflict);
      if (candidates.length === 1 && candidates[0].codes.length === 1) {
        addLockedBundle(candidates[0]);
      } else if (candidates.length > 0) {
        unresolvedTokens.push({ key: token.raw, candidates });
      }
    } else if (token.type === 'courseId') {
      const candidates = findBundlesForCourse(token.raw, bundles).filter((b) => !b.hasInternalConflict);
      if (candidates.length > 0) {
        unresolvedTokens.push({ key: token.raw, candidates });
      }
    }
  }

  return { lockedBundles, unresolvedTokens };
}

function createInitialSearchState(lockedBundles: Bundle[], allUnresolvedKeys: string[]): SearchState | null {
  let state: SearchState = {
    bundles: [],
    resolvedCourseIds: [],
    missingCourseIds: [],
    rows: [],
    slotKeys: [],
    coveredCount: 0,
    variantRankSum: 0,
    standaloneSuffixPenaltySum: 0,
    originalIndexSum: 0,
  };

  for (const bundle of lockedBundles) {
    const next = tryAddBundle(state, bundle, '');
    if (!next) return null;
    state = {
      ...next,
      // Locked classes should appear in output but should not count as resolved
      // course-id suggestions in labels.
      resolvedCourseIds: [],
      coveredCount: 0,
    };
  }

  state.missingCourseIds = allUnresolvedKeys;
  return state;
}

function tryAddBundle(state: SearchState, bundle: Bundle, resolvedKey: string): SearchState | null {
  if (bundle.hasInternalConflict) return null;
  if (hasSlotConflict(state.slotKeys, bundle.slotKeys)) return null;

  const missingCourseIds = resolvedKey
    ? state.missingCourseIds.filter((key) => key !== resolvedKey)
    : state.missingCourseIds;

  return {
    bundles: [...state.bundles, bundle],
    resolvedCourseIds: resolvedKey ? [...state.resolvedCourseIds, resolvedKey] : state.resolvedCourseIds,
    missingCourseIds,
    rows: [...state.rows, ...bundle.rows],
    slotKeys: mergeSlotKeys(state.slotKeys, bundle.slotKeys),
    coveredCount: state.coveredCount + (resolvedKey ? 1 : 0),
    variantRankSum: state.variantRankSum + bundle.variantRank,
    standaloneSuffixPenaltySum: state.standaloneSuffixPenaltySum + bundle.standaloneSuffixPenalty,
    originalIndexSum: state.originalIndexSum + bundle.originalIndex,
  };
}

function markMissing(state: SearchState, key: string): SearchState {
  if (state.missingCourseIds.includes(key)) return state;
  return { ...state, missingCourseIds: [...state.missingCourseIds, key] };
}

function rankAndDedupeStates(states: SearchState[]): SearchState[] {
  const bestByKey = new Map<string, SearchState>();

  for (const state of states) {
    const key = getStateKey(state);
    const existing = bestByKey.get(key);
    if (!existing || compareSearchStates(state, existing) < 0) {
      bestByKey.set(key, state);
    }
  }

  return [...bestByKey.values()].sort(compareSearchStates);
}

function getStateKey(state: SearchState): string {
  return state.bundles
    .flatMap((bundle) => bundle.codes)
    .sort()
    .join('|');
}

function compareSearchStates(a: SearchState, b: SearchState): number {
  return (
    b.coveredCount - a.coveredCount ||
    a.standaloneSuffixPenaltySum - b.standaloneSuffixPenaltySum ||
    a.variantRankSum - b.variantRankSum ||
    a.originalIndexSum - b.originalIndexSum
  );
}

function searchStateToRecommendation(state: SearchState): RecommendationGroup {
  return {
    bundles: state.bundles,
    resolvedCourseIds: state.resolvedCourseIds,
    missingCourseIds: state.missingCourseIds,
    rows: state.rows,
  };
}

// ---------------------------------------------------------------------------
// Token helpers for UI
// ---------------------------------------------------------------------------

/**
 * Check whether a base class code requires a variant choice.
 */
export function baseClassHasVariants(baseCode: string, bundles: Bundle[]): boolean {
  const bundle = findBundleByBaseCode(baseCode, bundles);
  return bundle !== undefined && bundle.codes.length > 1;
}

/**
 * Get all unique course IDs from the data.
 */
export function getAllCourseIds(allMaLop: string[]): string[] {
  const ids = new Set(allMaLop.map(getCourseId).filter(Boolean));
  return [...ids];
}

/**
 * Check if a course ID is known in the data.
 */
export function isKnownCourseId(courseId: string, allMaLop: string[]): boolean {
  return allMaLop.some((m) => getCourseId(m) === courseId);
}
