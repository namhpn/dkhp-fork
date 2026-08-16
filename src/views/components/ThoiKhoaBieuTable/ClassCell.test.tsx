import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { makeClass } from '../../../testFixtures';
import { useTkbStore } from '../../../zus';
import ClassCell, { ClassCellContext } from './ClassCell';
import { PhanLoaiHocTrenTruongContext } from './hooks';

const initialState = useTkbStore.getState();

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

function renderCell(overrides: Parameters<typeof makeClass>[0], props: { forExport?: boolean } = {}) {
  return render(
    <PhanLoaiHocTrenTruongContext>
      <ClassCellContext>
        <table>
          <tbody>
            <tr>
              <ClassCell data={makeClass(overrides)} {...props} />
            </tr>
          </tbody>
        </table>
      </ClassCellContext>
    </PhanLoaiHocTrenTruongContext>,
  );
}

const cellText = () => document.querySelector('.cell-class')?.textContent ?? '';

describe('ClassCell — missing NBD/NKT (files without BĐ/KT columns)', () => {
  it('export cell omits BĐ/KT lines when dates are empty', () => {
    renderCell({ MaMH: 'IT001', MaLop: 'IT001.O21', ThucHanh: 0, NBD: '', NKT: '' }, { forExport: true });
    expect(cellText()).not.toContain('BĐ:');
    expect(cellText()).not.toContain('KT:');
  });

  it('export cell omits BĐ/KT lines for legacy NaN-NaN-NaN values', () => {
    renderCell(
      { MaMH: 'IT001', MaLop: 'IT001.O21', ThucHanh: 0, NBD: 'NaN-NaN-NaN', NKT: 'NaN-NaN-NaN' },
      { forExport: true },
    );
    expect(cellText()).not.toContain('BĐ:');
    expect(cellText()).not.toContain('KT:');
  });

  it('export cell still shows BĐ/KT when dates exist', () => {
    renderCell(
      { MaMH: 'IT001', MaLop: 'IT001.O21', ThucHanh: 0, NBD: '2024-09-01', NKT: '2025-01-15' },
      { forExport: true },
    );
    expect(cellText()).toContain('BĐ: 2024-09-01');
    expect(cellText()).toContain('KT: 2025-01-15');
  });

  it('hovering shows no tooltip when dates are missing', async () => {
    renderCell({ MaMH: 'IT001', MaLop: 'IT001.O21', ThucHanh: 0, NBD: 'NaN-NaN-NaN', NKT: 'NaN-NaN-NaN' });
    fireEvent.mouseOver(document.querySelector('.cell-class')!);

    // MUI Tooltip opens after enterDelay (100ms default) — outlast it before asserting absence.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(document.body.textContent).not.toContain('BĐ:');
    expect(document.body.textContent).not.toContain('KT:');
  });

  it('hovering still shows BĐ/KT tooltip when dates exist', async () => {
    renderCell({
      MaMH: 'IT001',
      MaLop: 'IT001.O21',
      ThucHanh: 0,
      NBD: '2024-09-01',
      NKT: '2025-01-15',
    });
    fireEvent.mouseOver(document.querySelector('.cell-class')!);

    await waitFor(() => expect(screen.getByText(/BĐ: 2024-09-01/)).toBeInTheDocument());
    expect(screen.getByText(/KT: 2025-01-15/)).toBeInTheDocument();
  });
});
