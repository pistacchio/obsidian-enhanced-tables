import { EtDataColumn, CellValueFormatter } from 'src/utils/types';

export function makeFormatterForColumn(
  column: EtDataColumn,
  formatter?: string,
): CellValueFormatter {
  if (formatter) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return ($cell, $row, $ctx) => {
      try {
        return eval(formatter);
      } catch (e) {
        return $cell;
      }
    };
  }

  switch (column.type) {
    case 'number':
      return (val) => {
        try {
          return val.toLocaleString(undefined, column.numberFormat);
        } catch (e) {
          return val;
        }
      };
      break;
    case 'bool':
      return (val) => {
        try {
          return val ? column.yesFormat : column.noFormat;
        } catch (e) {
          return val;
        }
      };
      break;
    case 'date':
    case 'datetime':
    case 'time':
      return (val) => {
        try {
          return val.format(column.dateFormat);
        } catch (e) {
          return val;
        }
      };
      break;
    case 'enum':
      return (val) => {
        try {
          return (column.enum ?? {})[val] ?? val;
        } catch (e) {
          return val;
        }
      };
      break;
    default:
      return (val) => val;
  }
}

export function parseNumberFormat(
  format: string,
  defaultFormat: Record<string, any>,
): Record<string, any> {
  try {
    return eval(`({
      ${format}
    })`);
  } catch (e) {
    return defaultFormat;
  }
}
