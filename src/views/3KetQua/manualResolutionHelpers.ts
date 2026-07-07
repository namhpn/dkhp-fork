import type { Bundle, RecommendationGroup } from '../../manualInput';
import type { ClassModel } from '../../types';

export type SuggestionCombo = {
  subject: string;
  baseCode: string;
  practiceCodes: string[];
  practiceLabels: string[];
  fullCodes: string[];
  bundleKey: string;
  standaloneSuffixPenalty: number;
  variantRank: number;
  originalIndex: number;
};

export const getSubjectFromCode = (code: string): string => {
  const dotIdx = code.indexOf('.');
  return dotIdx === -1 ? code : code.substring(0, dotIdx);
};

const getCompactPracticeLabel = (practiceCode: string): string => {
  const parts = practiceCode.split('.');
  return parts.length > 1 ? parts.slice(1).join('.') : practiceCode;
};

const getBundleKey = (codes: string[]): string => codes.slice().sort().join('|');

const isRecommendationChoiceBundle = (rec: RecommendationGroup, bundle: Bundle): boolean => {
  const subject = getSubjectFromCode(bundle.baseCode);
  return rec.resolvedCourseIds.includes(subject) || rec.resolvedCourseIds.includes(bundle.baseCode);
};

const recommendationContainsCodes = (rec: RecommendationGroup, codes: string[]): boolean => {
  if (codes.length === 0) return true;
  const recCodes = new Set(rec.bundles.flatMap((bundle) => bundle.codes));
  return codes.every((code) => recCodes.has(code));
};

export const comboFromBundle = (bundle: Bundle): SuggestionCombo => {
  const practiceCodes = bundle.codes.filter((code) => code !== bundle.baseCode);
  return {
    subject: getSubjectFromCode(bundle.baseCode),
    baseCode: bundle.baseCode,
    practiceCodes,
    practiceLabels: practiceCodes.map(getCompactPracticeLabel),
    fullCodes: bundle.codes,
    bundleKey: getBundleKey(bundle.codes),
    standaloneSuffixPenalty: bundle.standaloneSuffixPenalty,
    variantRank: bundle.variantRank,
    originalIndex: bundle.originalIndex,
  };
};

export const compareSuggestionCombos = (a: SuggestionCombo, b: SuggestionCombo): number => {
  return (
    a.standaloneSuffixPenalty - b.standaloneSuffixPenalty ||
    a.baseCode.localeCompare(b.baseCode) ||
    a.variantRank - b.variantRank ||
    a.originalIndex - b.originalIndex ||
    a.practiceLabels.join(',').localeCompare(b.practiceLabels.join(','))
  );
};

export const buildSubjectCombos = (
  recommendations: RecommendationGroup[],
  manualResolvedMaLop: string[],
): Record<string, SuggestionCombo[]> => {
  const subjects = new Set<string>();

  for (const rec of recommendations) {
    for (const bundle of rec.bundles) {
      if (isRecommendationChoiceBundle(rec, bundle)) {
        subjects.add(getSubjectFromCode(bundle.baseCode));
      }
    }
  }

  const map: Record<string, SuggestionCombo[]> = {};

  for (const subject of subjects) {
    const selectedOtherSubjectCodes = manualResolvedMaLop.filter((code) => getSubjectFromCode(code) !== subject);
    const seen = new Set<string>();
    const combos: SuggestionCombo[] = [];

    for (const rec of recommendations) {
      if (!recommendationContainsCodes(rec, selectedOtherSubjectCodes)) continue;

      for (const bundle of rec.bundles) {
        if (!isRecommendationChoiceBundle(rec, bundle)) continue;
        if (getSubjectFromCode(bundle.baseCode) !== subject) continue;

        const combo = comboFromBundle(bundle);
        if (seen.has(combo.bundleKey)) continue;

        seen.add(combo.bundleKey);
        combos.push(combo);
      }
    }

    if (combos.length > 0) {
      map[subject] = combos.sort(compareSuggestionCombos);
    }
  }

  return map;
};

export const buildSelectedComboMap = (manualResolvedMaLop: string[]): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  manualResolvedMaLop.forEach((code) => {
    const subj = getSubjectFromCode(code);
    if (!map[subj]) map[subj] = [];
    map[subj].push(code);
  });
  return map;
};

export const isSelectedCombo = (
  subject: string,
  combo: SuggestionCombo,
  selectedCombo: Record<string, string[]>,
): boolean => {
  const sel = selectedCombo[subject];
  if (!sel || sel.length !== combo.fullCodes.length) return false;
  return combo.fullCodes.every((code) => sel.includes(code));
};

export const buildSubjectQueueOrder = (subjectCombos: Record<string, SuggestionCombo[]>): string[] => {
  return Object.entries(subjectCombos)
    .sort(([, a], [, b]) => a.length - b.length)
    .map(([subj]) => subj);
};

export const countUnresolvedSubjects = (
  queueOrder: string[],
  selectedCombo: Record<string, string[]>,
  subjectCombos: Record<string, SuggestionCombo[]>,
): number => {
  return queueOrder.filter((subject) => {
    const combos = subjectCombos[subject];
    if (!combos) return false;
    return !combos.some((combo) => isSelectedCombo(subject, combo, selectedCombo));
  }).length;
};

export const countResolvedSubjects = (
  queueOrder: string[],
  selectedCombo: Record<string, string[]>,
  subjectCombos: Record<string, SuggestionCombo[]>,
): number => {
  return queueOrder.filter((subject) => {
    const combos = subjectCombos[subject];
    if (!combos) return false;
    return combos.some((combo) => isSelectedCombo(subject, combo, selectedCombo));
  }).length;
};

const isUnresolvedSubject = (
  subject: string,
  subjectCombos: Record<string, SuggestionCombo[]>,
  selectedCombo: Record<string, string[]>,
): boolean => {
  const combos = subjectCombos[subject];
  if (!combos) return false;
  return !combos.some((combo) => isSelectedCombo(subject, combo, selectedCombo));
};

export const findNextUnresolvedSubject = (
  queueOrder: string[],
  subjectCombos: Record<string, SuggestionCombo[]>,
  selectedCombo: Record<string, string[]>,
  afterSubject?: string,
): string | null => {
  if (queueOrder.length === 0) return null;

  let startIndex = 0;
  if (afterSubject) {
    const idx = queueOrder.indexOf(afterSubject);
    startIndex = idx === -1 ? 0 : idx + 1;
  }

  for (let i = startIndex; i < queueOrder.length; i++) {
    const subject = queueOrder[i];
    if (isUnresolvedSubject(subject, subjectCombos, selectedCombo)) return subject;
  }

  for (let i = 0; i < startIndex; i++) {
    const subject = queueOrder[i];
    if (isUnresolvedSubject(subject, subjectCombos, selectedCombo)) return subject;
  }

  return null;
};

export const formatComboCodeLabel = (combo: SuggestionCombo): string => {
  if (combo.practiceLabels.length === 0) return combo.baseCode;
  return `${combo.baseCode} + ${combo.practiceLabels.join(' + ')}`;
};

export const formatClassSchedule = (row: ClassModel): string => {
  if (!row.Thu || row.Thu === '*') return '—';
  return `Thứ ${row.Thu} · Tiết ${row.Tiet}`;
};

export const formatClassKindPrefix = (row: ClassModel): string => {
  return row.ThucHanh > 0 ? 'Thực hành:' : 'Lý thuyết:';
};

export const formatClassRowMeta = (row: ClassModel): string => {
  const details = [row.TenGV, formatClassSchedule(row), row.PhongHoc].filter(Boolean).join(' · ');
  return `${formatClassKindPrefix(row)} ${details}`;
};

export const getSubjectCourseName = (
  combos: SuggestionCombo[],
  classByMaLop: Map<string, ClassModel>,
): string | null => {
  for (const combo of combos) {
    const rows = getComboClassRows(combo, classByMaLop);
    const name = rows.find((row) => row.TenMH)?.TenMH;
    if (name) return name;
  }
  return null;
};

export const getComboClassRows = (
  combo: SuggestionCombo,
  classByMaLop: Map<string, ClassModel>,
): ClassModel[] => {
  return combo.fullCodes
    .map((code) => classByMaLop.get(code))
    .filter((row): row is ClassModel => row !== undefined);
};