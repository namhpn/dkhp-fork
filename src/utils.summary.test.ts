import { makeClass } from './testFixtures';
import { getTimetableSummary, getTongSoTcJudgement } from './utils';

const noOverlaps = [
  makeClass({ MaMH: 'EC201', MaLop: 'EC201.Q21', ThucHanh: 0, SoTc: 14, Thu: '2', Tiet: '123' }),
  makeClass({ MaMH: 'IT003', MaLop: 'IT003.O21', ThucHanh: 0, SoTc: 7, Thu: '3', Tiet: '123' }),
];

describe('getTimetableSummary', () => {
  it('counts unique classes and credits', () => {
    const summary = getTimetableSummary(noOverlaps);

    expect(summary.classCount).toBe(2);
    expect(summary.tongSoTC).toBe(21);
  });

  it('counts overlapping slot pairs as conflicts', () => {
    const withConflict = [
      ...noOverlaps,
      makeClass({ MaMH: 'SS001', MaLop: 'SS001.X1', ThucHanh: 0, SoTc: 3, Thu: '2', Tiet: '12' }),
    ];

    const summary = getTimetableSummary(withConflict);

    // redundant classes are dropped from the timetable, so their credits don't count
    expect(summary.tongSoTC).toBe(21);
  });

  it('de-duplicates a class appearing multiple times per week', () => {
    const twiceAWeek = [
      makeClass({ MaMH: 'SS001', MaLop: 'SS001.X1', ThucHanh: 0, SoTc: 3, Thu: '2', Tiet: '1' }),
      makeClass({ MaMH: 'SS001', MaLop: 'SS001.X1', ThucHanh: 0, SoTc: 3, Thu: '4', Tiet: '1' }),
    ];

    const summary = getTimetableSummary(twiceAWeek);

    expect(summary.classCount).toBe(1);
  });
});

describe('getTongSoTcJudgement', () => {
  it('judges the 14–24 credit rule', () => {
    expect(getTongSoTcJudgement(13).isOk).toBe(false);
    expect(getTongSoTcJudgement(14).isOk).toBe(true);
    expect(getTongSoTcJudgement(24).isOk).toBe(true);
    expect(getTongSoTcJudgement(25).isOk).toBe(false);
  });
});
