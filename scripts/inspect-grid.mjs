import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const sampleRows = Array.from({ length: 20 }, (_, i) => ({
  STT: i + 1,
  MaMH: `MH${i}`,
  TenMH: `Course ${i}`,
  MaLop: `CLASS.${i}`,
  ThucHanh: 0,
  TenGV: undefined,
  MaGV: undefined,
  SiSo: '30',
  PhongHoc: undefined,
  SoTc: 3,
  HTGD: 'LT',
  Thu: '2',
  Tiet: '123',
  CachTuan: '0',
  KhoaHoc: '2021',
  HocKy: '1',
  NamHoc: '2024-2025',
  HeDT: 'CQ',
  KhoaQL: 'CNTT',
  NBD: '',
  NKT: '',
  GhiChu: '',
  NgonNgu: 'VN',
}));

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.evaluate((rows) => {
  localStorage.setItem(
    'tkb-state-storage',
    JSON.stringify({
      state: {
        dataExcel: {
          fileName: 'test.xlsx',
          data: rows,
          lastUpdateTimestamp: Date.now(),
        },
        selectedClasses: [],
        agGridColumnState: null,
        agGridFilterModel: null,
        isChiVeTkb: false,
        textareaChiVeTkb: '',
        manualResolvedMaLop: [],
      },
      version: 0,
    }),
  );
}, sampleRows);
await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
await page.waitForSelector('.grid-result-summary', { timeout: 15000 });
await page.waitForTimeout(500);

const summary = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      selector: sel,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      display: cs.display,
      overflow: cs.overflow,
      flex: cs.flex,
      height: cs.height,
      minHeight: cs.minHeight,
      maxHeight: cs.maxHeight,
      visibility: cs.visibility,
      opacity: cs.opacity,
    };
  };

  const agRows = document.querySelectorAll('.ag-row').length;
  const agCenterCols = document.querySelectorAll('.ag-center-cols-container .ag-row').length;

  return {
    summaryText: document.querySelector('.grid-result-summary')?.textContent?.trim() ?? null,
    agRows,
    agCenterCols,
    gridFrame: pick('.grid-frame'),
    gridWithToolbar: pick('.grid-with-toolbar'),
    courseGrid: pick('.course-grid'),
    agRoot: pick('.ag-root-wrapper'),
    agBodyViewport: pick('.ag-body-viewport'),
    workspaceMain: pick('.workspace-main'),
  };
});

console.log(JSON.stringify(summary, null, 2));
await browser.close();