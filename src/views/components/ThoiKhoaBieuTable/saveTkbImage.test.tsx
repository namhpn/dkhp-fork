import { render, waitFor } from '@testing-library/react';
import html2canvas from 'html2canvas';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { useProcessImageTkb } from './hooks';

jest.mock('html2canvas', () => jest.fn());
jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

const mockedHtml2canvas = html2canvas as jest.MockedFunction<typeof html2canvas>;
const mockedEnqueueSnackbar = enqueueSnackbar as jest.MockedFunction<typeof enqueueSnackbar>;

function ExportHarness({ onReady }: { onReady: (save: () => Promise<void>) => void }) {
  const { tkbTableRef, saveTkbImageToComputer } = useProcessImageTkb();

  React.useEffect(() => {
    onReady(saveTkbImageToComputer);
  }, [onReady, saveTkbImageToComputer]);

  return <div id="thoi-khoa-bieu-export" ref={tkbTableRef} />;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('saveTkbImageToComputer captures export wrapper with hex-safe html2canvas options', async () => {
  const canvas = document.createElement('canvas');
  mockedHtml2canvas.mockResolvedValue(canvas as never);

  let save!: () => Promise<void>;
  render(<ExportHarness onReady={(fn) => { save = fn; }} />);

  await waitFor(() => expect(save).toBeDefined());
  await save();

  expect(mockedHtml2canvas).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'thoi-khoa-bieu-export' }),
    expect.objectContaining({
      backgroundColor: '#ffffff',
      onclone: expect.any(Function),
    }),
  );
  expect(mockedEnqueueSnackbar).not.toHaveBeenCalled();
});

test('saveTkbImageToComputer surfaces a snackbar when html2canvas rejects oklch colors', async () => {
  mockedHtml2canvas.mockRejectedValue(
    new Error('Attempting to parse an unsupported color function "oklch"'),
  );

  let save!: () => Promise<void>;
  render(<ExportHarness onReady={(fn) => { save = fn; }} />);

  await waitFor(() => expect(save).toBeDefined());
  await save();

  expect(mockedEnqueueSnackbar).toHaveBeenCalledWith(
    'Tải ảnh TKB thất bại, vui lòng thử lại.',
    { variant: 'error' },
  );
});