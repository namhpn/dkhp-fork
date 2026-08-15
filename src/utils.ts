import uniqBy from 'lodash/uniqBy';
import { Buoi, ClassModel } from 'types';

export type TTrungTkb = {
  existing: ClassModel;
  new: ClassModel[];
};

export function uniqMaLop(classes: ClassModel[]): ClassModel[] {
  return uniqBy(classes, 'MaLop'); // Có nhiều lớp học nhiều buổi 1 tuần, xuất hiện nhiều lần, nhưng chỉ nên cộng 1 lần
}

export function calcTongSoTC(classes: ClassModel[]) {
  const { kept } = findOverlapedClasses(classes);
  const unique = uniqMaLop(kept);
  return unique.reduce((acc, cur) => acc + cur.SoTc, 0);
}

export function getTongSoTcJudgement(tongSoTC: number) {
  const text =
    tongSoTC < 14
      ? 'Chưa đạt số TC quy định: 14'
      : tongSoTC > 24
        ? 'Vượt quá số TC quy định: 24'
        : 'Thỏa mãn số TC quy định 14-24';
  const isOk = tongSoTC >= 14 && tongSoTC <= 24;
  return {
    isOk,
    text,
  };
}

export function extractListMaLop(classes: ClassModel[]) {
  const unique = uniqMaLop(classes);
  return unique.map((it) => it.MaLop);
}

export const getBuoiFromTiet = (tiet: ClassModel['Tiet']): Buoi => {
  if (tiet.includes('11')) return Buoi.Toi;
  if (/1|2|3|4|5/g.test(tiet)) return Buoi.Sang;
  if (/6|7|8|9|0/g.test(tiet)) return Buoi.Chieu;
  return Buoi.N_A;
};

export const getDanhSachTiet = (tiet: ClassModel['Tiet']): string[] => {
  const raw = tiet.trim();
  if (raw.includes(',')) return raw.split(',').map((s) => s.trim()).filter(Boolean).map((s) => s === '0' ? '10' : s);
  if (raw === '*') return ['*'];
  const s = raw.replace(/\s+/g, '');
  if (!s) return [];
  if (s === '0') return ['10'];
  const consecutive = parseConsecutiveTietString(s);
  if (consecutive) return consecutive;
  return parseGenericTietString(s);
};

const parseConsecutiveTietString = (s: string): string[] | null => {
  const candidates: string[][] = [];
  for (let len = 1; len <= 2 && len <= s.length; len++) {
    const prefix = s.slice(0, len);
    if (prefix === '0') continue;
    if (!/^\d+$/.test(prefix)) continue;
    const first = parseInt(prefix, 10);
    if (first < 1 || first > 14) continue;
    if (String(first) !== prefix) continue;
    const seq: string[] = [prefix];
    let pos = len;
    let cur = first;
    let ok = true;
    while (pos < s.length) {
      const nxt = cur + 1;
      if (nxt > 14) { ok = false; break; }
      const nxtStr = String(nxt);
      if (s.slice(pos, pos + nxtStr.length) !== nxtStr) { ok = false; break; }
      seq.push(nxtStr);
      pos += nxtStr.length;
      cur = nxt;
    }
    if (ok && pos === s.length) candidates.push(seq);
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
};

const parseGenericTietString = (s: string): string[] => {
  const memo = new Map<number, string[] | null>();
  const dfs = (pos: number): string[] | null => {
    if (pos === s.length) return [];
    if (memo.has(pos)) return memo.get(pos)!;
    const ch = s[pos];
    let best: string[] | null = null;
    const tryCandidate = (cand: string[] | null) => {
      if (cand === null) return;
      if (best === null || cand.length > best.length) best = cand;
    };
    if (ch === '0') {
      const rest = dfs(pos + 1);
      if (rest !== null) tryCandidate(['10', ...rest]);
    } else if (ch >= '1' && ch <= '9') {
      const restSingle = dfs(pos + 1);
      if (restSingle !== null) tryCandidate([ch, ...restSingle]);
      if (pos + 1 < s.length) {
        const two = s.slice(pos, pos + 2);
        const val = parseInt(two, 10);
        if (val >= 10 && val <= 14 && String(val) === two) {
          const restTwo = dfs(pos + 2);
          if (restTwo !== null) tryCandidate([two, ...restTwo]);
        }
      }
    } else if (ch === ' ' || ch === '\t') {
      const rest = dfs(pos + 1);
      if (rest !== null) tryCandidate(rest);
    }
    memo.set(pos, best);
    return best;
  };
  const result = dfs(0);
  if (result) return result;
  return s.split('').map((c) => (c === '0' ? '10' : c)).filter(Boolean);
};

/**
 * "*": Không lên trường
 * 2-1, 2-2, 2-3: Thứ 2, tiết 1,2,3
 * 7-11, 7-12, 7-13: Thứ 7, tiết 11,12,13
 */
type ValidTimeSlot = `${string}-${string}`;
type TimeSlots = '*' | ValidTimeSlot[];
const getTimeSlots = ({ Thu, Tiet }: ClassModel): TimeSlots => {
  if (Thu === '*') return '*';
  return getDanhSachTiet(Tiet).map((tiet): ValidTimeSlot => `${Thu}-${tiet}`);
};

const isTimeSlotsOverlap = (timeSlotsA: TimeSlots, timeSlotsB: TimeSlots) => {
  if (timeSlotsA === '*' || timeSlotsB === '*') return false;
  return timeSlotsA.some((slotA) => timeSlotsB.includes(slotA));
};

export const hasOverlapSchedule = (classAs: ClassModel[], classB: ClassModel) => {
  const classBTimeSlots = getTimeSlots(classB);
  return classAs.some((classA) => {
    if (isSameAgGridRowId(classA, classB)) return false;
    const classATimeSlots = getTimeSlots(classA);
    return isTimeSlotsOverlap(classATimeSlots, classBTimeSlots);
  });
};

export const getConflictMaLop = (selectedClasses: ClassModel[], candidate: ClassModel): string | null => {
  const candidateTimeSlots = getTimeSlots(candidate);
  for (const selected of selectedClasses) {
    if (isSameAgGridRowId(selected, candidate)) continue;
    const selectedTimeSlots = getTimeSlots(selected);
    if (isTimeSlotsOverlap(selectedTimeSlots, candidateTimeSlots)) {
      return selected.MaLop;
    }
  }
  return null;
};

// Thường thì MaLop alone is enough because most of the classes only appear once a week or once every 2 weeks, nhưng mà có thể có môn Anh Văn học 1 tuần tới 2 buổi, nên cần có thêm Thu và Tiet
// TODO: maybe use STT?
export const getAgGridRowId = (classModel: ClassModel): string => {
  return classModel.MaLop + classModel.Thu + classModel.Tiet;
};

export const isSameAgGridRowId = (class1: ClassModel, class2: ClassModel) => {
  return getAgGridRowId(class1) === getAgGridRowId(class2);
};

export const findOverlapedClasses = (
  /** the first elements in the array will have higher priority, it's OK to have duplicated classes */
  classes: ClassModel[],
): { kept: ClassModel[]; redundant: TTrungTkb[] } => {
  const kept: ClassModel[] = [];
  const redundant: TTrungTkb[] = [];

  const findExistingOverlap = (newClass: ClassModel) => {
    const newClassTimeSlots = getTimeSlots(newClass);
    return kept.find((existingClass) => {
      const existingClassTimeSlots = getTimeSlots(existingClass);
      return isTimeSlotsOverlap(existingClassTimeSlots, newClassTimeSlots);
    });
  };

  const processedAgGridRowIds = new Set<string>();
  classes.forEach((addingClass) => {
    const agGridRowId = getAgGridRowId(addingClass);
    if (processedAgGridRowIds.has(agGridRowId)) return;

    processedAgGridRowIds.add(agGridRowId);
    const existingClassOverlapped = findExistingOverlap(addingClass);
    // TODO: refactor the mess below
    const existingRedundant =
      existingClassOverlapped && redundant.find((it) => isSameAgGridRowId(it.existing, existingClassOverlapped));
    if (existingRedundant) {
      existingRedundant.new.push(addingClass);
    } else if (existingClassOverlapped) {
      redundant.push({
        existing: existingClassOverlapped,
        new: [addingClass],
      });
    } else {
      kept.push(addingClass);
    }
  });

  return { kept, redundant };
};

export const log = (...args: any[]) => {
  const productionMode = process.env.NODE_ENV === 'production';
  if (window.__DEBUG__ || !productionMode) console.log(...args);
};
