import { makeClass } from '../../testFixtures';
import {
  countResolvedSubjects,
  countUnresolvedSubjects,
  findNextUnresolvedSubject,
  formatClassKindPrefix,
  formatClassRowMeta,
  getSubjectCourseName,
} from './manualResolutionHelpers';
import type { SuggestionCombo } from './manualResolutionHelpers';

const makeCombo = (subject: string, baseCode: string): SuggestionCombo => ({
  subject,
  baseCode,
  practiceCodes: [],
  practiceLabels: [],
  fullCodes: [baseCode],
  bundleKey: baseCode,
  standaloneSuffixPenalty: 0,
  variantRank: 0,
  originalIndex: 0,
});

describe('manualResolutionHelpers formatting', () => {
  const ltRow = makeClass({
    MaMH: 'EC201',
    MaLop: 'EC201.O21',
    ThucHanh: 0,
    TenMH: 'Phân tích thiết kế quy trình nghiệp vụ doanh nghiệp',
    TenGV: 'Trình Trọng Tín',
    Thu: '4',
    Tiet: '1234',
    PhongHoc: 'B7.04',
  });

  const thRow = makeClass({
    MaMH: 'EC201',
    MaLop: 'EC201.O21.1',
    ThucHanh: 1,
    TenMH: 'Phân tích thiết kế quy trình nghiệp vụ doanh nghiệp',
    TenGV: 'Trình Trọng Tín',
    Thu: '*',
    Tiet: '*',
    PhongHoc: '*',
  });

  it('labels theory and practice rows', () => {
    expect(formatClassKindPrefix(ltRow)).toBe('Lý thuyết:');
    expect(formatClassKindPrefix(thRow)).toBe('Thực hành:');
  });

  it('formats row meta with kind prefix', () => {
    expect(formatClassRowMeta(ltRow)).toBe('Lý thuyết: Trình Trọng Tín · Thứ 4 · Tiết 1234 · B7.04');
    expect(formatClassRowMeta(thRow)).toBe('Thực hành: Trình Trọng Tín · — · *');
  });

  it('reads course name once for the active subject', () => {
    const combo: SuggestionCombo = {
      subject: 'EC201',
      baseCode: 'EC201.O21',
      practiceCodes: ['EC201.O21.1'],
      practiceLabels: ['O21.1'],
      fullCodes: ['EC201.O21', 'EC201.O21.1'],
      bundleKey: 'EC201.O21|EC201.O21.1',
      standaloneSuffixPenalty: 0,
      variantRank: 0,
      originalIndex: 0,
    };
    const classByMaLop = new Map([
      [ltRow.MaLop, ltRow],
      [thRow.MaLop, thRow],
    ]);

    expect(getSubjectCourseName([combo], classByMaLop)).toBe(ltRow.TenMH);
  });
});

describe('countResolvedSubjects', () => {
  const queueOrder = ['A', 'B', 'C'];
  const subjectCombos = {
    A: [makeCombo('A', 'A.1')],
    B: [makeCombo('B', 'B.1')],
    C: [makeCombo('C', 'C.1')],
  };

  it('counts subjects with a selected combo', () => {
    const selectedCombo = { A: ['A.1'], C: ['C.1'] };

    expect(countResolvedSubjects(queueOrder, selectedCombo, subjectCombos)).toBe(2);
    expect(countUnresolvedSubjects(queueOrder, selectedCombo, subjectCombos)).toBe(1);
  });

  it('returns zero when nothing is selected', () => {
    expect(countResolvedSubjects(queueOrder, {}, subjectCombos)).toBe(0);
  });
});

describe('findNextUnresolvedSubject', () => {
  const queueOrder = ['A', 'B', 'C'];
  const subjectCombos = {
    A: [makeCombo('A', 'A.1')],
    B: [makeCombo('B', 'B.1')],
    C: [makeCombo('C', 'C.1')],
  };

  it('returns the first unresolved subject when afterSubject is omitted', () => {
    const selectedCombo = { A: ['A.1'] };

    expect(findNextUnresolvedSubject(queueOrder, subjectCombos, selectedCombo)).toBe('B');
  });

  it('returns the next unresolved subject after afterSubject', () => {
    const selectedCombo = { A: ['A.1'] };

    expect(findNextUnresolvedSubject(queueOrder, subjectCombos, selectedCombo, 'A')).toBe('B');
    expect(findNextUnresolvedSubject(queueOrder, subjectCombos, selectedCombo, 'B')).toBe('C');
  });

  it('wraps around to find unresolved subjects before afterSubject', () => {
    const selectedCombo = { B: ['B.1'], C: ['C.1'] };

    expect(findNextUnresolvedSubject(queueOrder, subjectCombos, selectedCombo, 'C')).toBe('A');
  });

  it('returns null when every subject is resolved', () => {
    const selectedCombo = {
      A: ['A.1'],
      B: ['B.1'],
      C: ['C.1'],
    };

    expect(findNextUnresolvedSubject(queueOrder, subjectCombos, selectedCombo, 'B')).toBeNull();
  });
});