import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SAMPLE_CLASSES, SAMPLE_DATA_EXCEL } from '../../testFixtures';
import { useTkbStore } from '../../zus';
import HeaderFileControl from './HeaderFileControl';

jest.mock('../1ChonFileExcel/useExcelImport', () => ({
  useExcelImport: () => ({
    isImporting: false,
    triggerFileInput: jest.fn(),
    fileInputRef: { current: null },
    handleFileChange: jest.fn(),
    sheetJSFT: '.xlsx,.xls',
  }),
}));

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

test('renders upload button when no file is loaded', () => {
  render(<HeaderFileControl />);

  expect(screen.getByRole('button', { name: 'Tải file thời khóa biểu (.xlsx)' })).toBeInTheDocument();
});

test('when file is loaded, shows filename and does not render Đổi file button', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<HeaderFileControl />);

  expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Đổi file' })).not.toBeInTheDocument();
});

test('remove button has aria-label Xóa file', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  render(<HeaderFileControl />);

  expect(screen.getByLabelText('Xóa file')).toBeInTheDocument();
});

test('with destructive state, clicking remove opens confirm dialog titled Xóa file?', () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses([SAMPLE_CLASSES[0]]);
  render(<HeaderFileControl />);

  fireEvent.click(screen.getByLabelText('Xóa file'));

  expect(screen.getByRole('heading', { name: 'Xóa file?' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Xóa file' })).toBeInTheDocument();
});

test('confirming remove clears file and shows upload button again', async () => {
  useTkbStore.getState().setDataExcel(SAMPLE_DATA_EXCEL);
  useTkbStore.getState().setSelectedClasses([SAMPLE_CLASSES[0]]);
  render(<HeaderFileControl />);

  fireEvent.click(screen.getByLabelText('Xóa file'));
  fireEvent.click(screen.getByRole('button', { name: 'Xóa file' }));

  await waitFor(() => {
    expect(useTkbStore.getState().dataExcel).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  expect(screen.getByRole('button', { name: 'Tải file thời khóa biểu (.xlsx)' })).toBeInTheDocument();
});
