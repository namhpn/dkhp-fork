import { render, screen } from '@testing-library/react';
import { SAMPLE_DATA_EXCEL } from '../../testFixtures';
import { useTkbStore } from '../../zus';
import Workspace from './Workspace';

const initialState = useTkbStore.getState();

beforeEach(() => {
  localStorage.clear();
  useTkbStore.setState({
    ...initialState,
    dataExcel: null,
    selectedClasses: [],
    isChiVeTkb: true,
    textareaChiVeTkb: '',
    manualResolvedMaLop: [],
  });
});

test('xlsx upload switches to grid mode and shows GridWorkspace', () => {
  useTkbStore.getState().setIsChiVeTkb(true);
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<Workspace />);

  expect(screen.getByLabelText(/Khu vực làm việc/i)).toBeInTheDocument();
  expect(useTkbStore.getState().isChiVeTkb).toBe(false);
  expect(document.querySelector('.manual-workspace')).toBeNull();
  expect(document.querySelector('.grid-frame')).toBeTruthy();
});

test('grid mode shows GridWorkspace shell when xlsx is loaded', () => {
  useTkbStore.getState().setIsChiVeTkb(false);
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<Workspace />);

  expect(document.querySelector('.manual-workspace')).toBeNull();
  expect(document.querySelector('.grid-frame')).toBeTruthy();
});

test('AG Grid renders row nodes when xlsx data is loaded', () => {
  useTkbStore.getState().setIsChiVeTkb(false);
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<Workspace />);

  expect(document.querySelector('.course-grid .ag-root-wrapper')).toBeTruthy();
  expect(document.querySelectorAll('.ag-center-cols-container .ag-row').length).toBeGreaterThan(0);
});
