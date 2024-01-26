export type RawTableData = {
  columns: string[];
  rows: string[][];
};

export type CellValueFormatter = (cell: any, row: any, ctx: any) => any;

// Configuration

export type EtConfigurationColumnType =
  | 'string'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'time'
  | 'enum';

export type EtConfigurationPagination = {
  'page-size': number;
  'page-sizes'?: number[];
};

export type EtConfiguration = {
  columns?: Record<string, EtConfigurationColumn>;
  editable?: boolean;
  'date-format'?: string;
  'datetime-format'?: string;
  'yes-format'?: string;
  'no-format'?: string;
  filter?: string;
  filters?: Record<string, string>;
  sort?: string;
  pagination?: EtConfigurationPagination;
  'hide-controls': boolean;
  'hide-configuration': boolean;
  style?: string;
  'fix-header'?: boolean;
};

export type EtConfigurationColumn = {
  alias?: string;
  type?: EtConfigurationColumnType;
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

export type EtDataColumn = Omit<
  EtConfigurationColumn,
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

export type EtDataCell = {
  el: HTMLTableCellElement;
  column: EtDataColumn;
  rawValue: string;
  value: any;
  formattedValue: any;
};

export type EtDataRow = {
  index: number;
  el: HTMLTableRowElement;
  cells: Record<string, EtDataCell>;
  orderedCells: EtDataCell[];
} & Record<string, any>;
