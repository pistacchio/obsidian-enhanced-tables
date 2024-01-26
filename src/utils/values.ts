import { moment } from 'obsidian';
import { AtcDataColumn } from 'src/utils/types';

export function extractValue(
  rawValue: string,
  column: AtcDataColumn,
  dateFormat: string,
  yesFormat: string,
): any {
  switch (column.type) {
    case 'number':
      try {
        return Number(rawValue);
      } catch (e) {
        return null;
      }
      break;
    case 'bool':
      try {
        return rawValue === yesFormat;
      } catch (e) {
        return null;
      }
      break;
    case 'date':
    case 'datetime':
    case 'time':
      try {
        const parsedDate = moment(rawValue, dateFormat);

        if (!parsedDate.isValid()) {
          return null;
        }

        return parsedDate;
      } catch (e) {
        return null;
      }
      break;
    default:
      return rawValue;
  }
}
