import { ClassModel } from './types';

const BASE_CLASS: Omit<ClassModel, 'MaLop' | 'MaMH' | 'ThucHanh'> = {
  STT: 1,
  TenMH: 'Test course',
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
};

export function makeClass(overrides: Partial<ClassModel> & Pick<ClassModel, 'MaLop' | 'MaMH' | 'ThucHanh'>): ClassModel {
  return { ...BASE_CLASS, ...overrides };
}

/** Minimal timetable rows for manual parser / store tests. */
export const SAMPLE_CLASSES: ClassModel[] = [
  makeClass({ MaMH: 'EC201', MaLop: 'EC201.Q21', ThucHanh: 0 }),
  makeClass({ MaMH: 'EC201', MaLop: 'EC201.Q21.1', ThucHanh: 1 }),
  makeClass({ MaMH: 'EC201', MaLop: 'EC204.Q22', ThucHanh: 0 }),
  makeClass({ MaMH: 'IT003', MaLop: 'IT003.O21', ThucHanh: 0 }),
  makeClass({ MaMH: 'IT003', MaLop: 'IT003.O21.1', ThucHanh: 1 }),
  makeClass({ MaMH: 'IT003', MaLop: 'IT003.O21.TTNT', ThucHanh: 0 }),
];

export const SAMPLE_DATA_EXCEL = {
  fileName: 'test.xlsx',
  data: SAMPLE_CLASSES,
  lastUpdateTimestamp: Date.now(),
};