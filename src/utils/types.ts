export type RawTableData = {
  columns: string[];
  rows: string[][];
};

export type CellValueFormatter = (cell: any, row: any) => any;

// Configuration

export type AtcConfigurationColumnType = 'string' | 'number' | 'date' | 'enum';

export type AtcConfigurationPagination = {
  'page-size': number;
  'page-sizes'?: number[];
};

export type AtcConfigurationColumn = {
  alias?: string;
  type?: AtcConfigurationColumnType;
  'date-format'?: string;
  'number-format'?: string;
  formatter?: string;
  enum?: Record<string, string>;
  hidden?: boolean;
};

export type AtcConfiguration = {
  columns?: Record<string, AtcConfigurationColumn>;
  'date-format'?: string;
  filter?: string;
  filters?: Record<string, string>;
  sort?: string;
  pagination?: AtcConfigurationPagination;
  'hide-controls': boolean;
  'hide-configuration': boolean;
};

// Data
export type Pagination = {
  pageSize: number;
  pageNumber: number;
  pageSizes: number[];
};

export type AtcDataColumn = Omit<
  AtcConfigurationColumn,
  'date-format' | 'number-format' | 'formatter'
> & {
  name: string;
  index: number;
  dateFormat: string;
  numberFormat: Record<string, any>;
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
  el: HTMLTableRowElement;
  cells: Record<string, AtcDataCell>;
  orderedCells: AtcDataCell[];
} & Record<string, any>;
