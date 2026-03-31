export type Platform = 'flipkart' | 'meesho' | 'meesho-invoice' | 'amazon';

export type PrinterType = 'lbl' | 'a4';

export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LabelInfo {
  pageIndex: number;
  pageNum: number;
  width: number;
  height: number;
  sku: string;
  qty: number;
  orderNo: string;
  courier: string;
  cropBounds: CropBounds;
}

export interface SkuSummary {
  sku: string;
  qty: number;
  count: number;
}

export interface MergeFile {
  name: string;
  buffer: ArrayBuffer;
}

export interface TabConfig {
  id: string;
  platform?: Platform;
  label: string;
  icon: string;
  badgeClass: string;
  description: string;
}
