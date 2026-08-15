import { act, fireEvent, render, screen } from '@testing-library/react';
import { SAMPLE_DATA_EXCEL } from '../../testFixtures';
import { useTkbStore } from '../../zus';
import Workspace, { WORKSPACE_PANEL_ID } from './Workspace';

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

  expect(useTkbStore.getState().isChiVeTkb).toBe(false);
  expect(document.querySelector('.manual-workspace')).toBeNull();
  expect(document.querySelector('.grid-frame')).toBeTruthy();
});

test('workspace panel is a tabpanel labelled by the active mode tab', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<Workspace />);

  const panel = screen.getByRole('tabpanel');
  expect(panel).toHaveAttribute('id', WORKSPACE_PANEL_ID);
  expect(panel).toHaveAttribute('aria-labelledby', 'mode-tab-grid');

  act(() => {
    useTkbStore.getState().setIsChiVeTkb(true);
  });
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'mode-tab-manual');
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

test('clicking a row selection toggle toggles once, not twice', async () => {
  useTkbStore.getState().setIsChiVeTkb(false);
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<Workspace />);

  const getToggle = () =>
    document.querySelector<HTMLButtonElement>('.ag-row .grid-selection-toggle:not(.is-disabled)');
  expect(getToggle()).toBeTruthy();

  // AG Grid's native row-click listener runs before React's button onClick; without the
  // embedded-control guard in onRowClicked this click toggles the row on and immediately off.
  await act(async () => {
    fireEvent.click(getToggle()!);
  });
  expect(useTkbStore.getState().selectedClasses).toHaveLength(1);
  expect(getToggle()?.classList.contains('is-selected')).toBe(true);

  await act(async () => {
    fireEvent.click(getToggle()!);
  });
  expect(useTkbStore.getState().selectedClasses).toHaveLength(0);
});
