import { render, screen } from '@testing-library/react';
import { makeClass, SAMPLE_DATA_EXCEL } from '../../testFixtures';
import { useTkbStore } from '../../zus';
import TimetablePanel from './TimetablePanel';

const initialState = useTkbStore.getState();

const selectedClasses = [
  makeClass({ MaMH: 'EC201', MaLop: 'EC201.Q21', ThucHanh: 0, SoTc: 14, Thu: '2', Tiet: '123' }),
  makeClass({ MaMH: 'IT003', MaLop: 'IT003.O21', ThucHanh: 0, SoTc: 7, Thu: '3', Tiet: '123' }),
];

beforeEach(() => {
  localStorage.clear();
  useTkbStore.setState({
    ...initialState,
    dataExcel: null,
    selectedClasses: [],
    isChiVeTkb: false,
    textareaChiVeTkb: '',
    manualResolvedMaLop: [],
  });
});

test('hides the toolbar when nothing is selected (no dead grey buttons)', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<TimetablePanel />);

  expect(screen.queryByRole('toolbar')).toBeNull();
  expect(screen.getByText('Chưa chọn lớp')).toBeInTheDocument();
});

test('stats are the live region; no summary line below the header', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses(selectedClasses);
  render(<TimetablePanel />);

  const stats = document.querySelector('.timetable-panel-stats');
  expect(stats).toBeTruthy();
  expect(stats?.getAttribute('aria-live')).toBe('polite');
  expect(document.querySelector('.timetable-summary')).toBeNull();
});

test('shows the credit rule in the stat label, judgement stays tooltip-only', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses([selectedClasses[0]]);
  render(<TimetablePanel />);

  expect(screen.getByText('Số tín chỉ (14–24)')).toBeInTheDocument();
  expect(document.querySelector('.timetable-stat-judgement')).toBeNull();
  expect(screen.queryByText(/quy định/i)).toBeNull();
});

test('exposes the out-of-range credit judgement on the stat, not just color', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses([
    makeClass({ MaMH: 'SS001', MaLop: 'SS001.X1', ThucHanh: 0, SoTc: 3, Thu: '2', Tiet: '123' }),
  ]);
  render(<TimetablePanel />);

  const creditStat = screen.getByLabelText(/Số tín chỉ: 3\. Chưa đạt số TC quy định: 14/);
  expect(creditStat.className).toContain('timetable-stat--warn');
});

test('makes "Sao chép script" the only filled (primary) panel action', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses(selectedClasses);
  render(<TimetablePanel />);

  const scriptButton = screen.getByRole('button', { name: 'Sao chép script' });
  expect(scriptButton.className).toContain('timetable-action-btn--primary');

  const otherButtons = screen
    .getAllByRole('button')
    .filter((b) => b.className.includes('timetable-action-btn') && !b.className.includes('--primary'));
  expect(otherButtons.length).toBe(2);
  otherButtons.forEach((b) => expect(b.className).toContain('MuiIconButton-root'));
});

test('copy actions sit in the title row; download overlays the timetable corner', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses(selectedClasses);
  render(<TimetablePanel />);

  expect(screen.queryByRole('button', { name: 'Chia sẻ' })).toBeNull();
  expect(screen.queryByRole('toolbar')).toBeNull();

  const copyMaLop = screen.getByRole('button', { name: 'Sao chép mã lớp' });
  expect(copyMaLop.closest('.timetable-panel-actions')).toBeTruthy();
  expect(copyMaLop.closest('.timetable-panel-actions')?.parentElement?.className).toContain(
    'timetable-panel-title-row',
  );

  const download = screen.getByRole('button', { name: 'Tải ảnh TKB' });
  expect(download.className).toContain('tkb-download-btn');
  expect(download.closest('.tkb-frame')).toBeTruthy();
  expect(download.closest('.tkb-frame')?.querySelector('#thoi-khoa-bieu-wrapper')).toBeTruthy();
});

test('does not render an autosave note (file state lives in the header control)', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<TimetablePanel />);

  expect(document.querySelector('.autosave-note')).toBeNull();
});

test('omits the language dash when a class has no language', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses([
    makeClass({ MaMH: 'EC201', MaLop: 'EC201.Q21', ThucHanh: 0, SoTc: 14, Thu: '2', Tiet: '123', NgonNgu: '' }),
  ]);
  render(<TimetablePanel />);

  const codeLine = document.querySelector('#thoi-khoa-bieu .cell-class strong');
  expect(codeLine?.textContent).toBe('EC201.Q21');
});
