export type RawTableData = {
  columns: string[];
  rows: string[][];
};

export type CellValueFormatter = (cell: any, row: any, ctx: any) => any;

// Configuration

export type AtcConfigurationColumnType =
  | 'string'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'enum';

export type AtcConfigurationPagination = {
  'page-size': number;
  'page-sizes'?: number[];
};

export type AtcConfigurationBoolean = {
  'yes-format'?: string;
  'no-format'?: string;
};

export type AtcConfiguration = {
  columns?: Record<string, AtcConfigurationColumn>;
  'date-format'?: string;
  'bool-format'?: string;
  filter?: string;
  filters?: Record<string, string>;
  sort?: string;
  pagination?: AtcConfigurationPagination;
  'hide-controls': boolean;
  'hide-configuration': boolean;
};

export type AtcConfigurationColumn = {
  alias?: string;
  type?: AtcConfigurationColumnType;
  'date-format'?: string;
  'number-format'?: string;
  formatter?: string;
  enum?: Record<string, string>;
  bool?: AtcConfigurationBoolean;
  hidden?: boolean;
  nowrap?: boolean;
};

// Data
export type Pagination = {
  pageSize: number;
  pageNumber: number;
  pageSizes: number[];
};

export type AtcDataColumn = Omit<
  AtcConfigurationColumn,
  'date-format' | 'bool' | 'bool-format' | 'number-format' | 'formatter'
> & {
  name: string;
  index: number;
  dateFormat: string;
  numberFormat: Record<string, any>;
  yesFormat: string;
  notFormat: string;
  formatter: CellValueFormatter;
  el: HTMLTableCellElement;
};

export type AtcDataCell = {
  el: HTMLTableCellElement;
  column: AtcDataColumn;
  rawValue: string;
  value: any;
  formattedValue: any;
};

export type AtcDataRow = {
  index: number;
  el: HTMLTableRowElement;
  cells: Record<string, AtcDataCell>;
  orderedCells: AtcDataCell[];
} & Record<string, any>;
