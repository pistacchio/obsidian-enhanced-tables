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
  | 'time'
  | 'enum';

export type AtcConfigurationPagination = {
  'page-size': number;
  'page-sizes'?: number[];
};

export type AtcConfiguration = {
  columns?: Record<string, AtcConfigurationColumn>;
  editable?: boolean;
  'date-format'?: string;
  'datetime-format'?: string;
  'yes-format'?: string;
  'no-format'?: string;
  filter?: string;
  filters?: Record<string, string>;
  sort?: string;
  pagination?: AtcConfigurationPagination;
  'hide-controls': boolean;
  'hide-configuration': boolean;
  style?: string;
  'fix-header'?: boolean;
};

export type AtcConfigurationColumn = {
  alias?: string;
  type?: AtcConfigurationColumnType;
  editable?: boolean;
  'date-format'?: string;
  'number-format'?: string;
  formatter?: string;
  enum?: Record<string, string>;
  'yes-format'?: string;
  'no-format'?: string;
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
  | 'date-format'
  | 'bool'
  | 'yes-format'
  | 'no-format'
  | 'number-format'
  | 'formatter'
> & {
  name: string;
  index: number;
  dateFormat: string;
  numberFormat: Record<string, any>;
  yesFormat: string;
  noFormat: string;
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
