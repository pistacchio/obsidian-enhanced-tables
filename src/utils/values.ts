import { moment } from 'obsidian';
import { AtcDataColumn } from 'src/utils/types';

export function extractValue(
  rawValue: string,
  column: AtcDataColumn,
  dateFormat: string,
): any {
  switch (column.type) {
    case 'number':
      try {
        return Number(rawValue);
      } catch (e) {
        return null;
      }
      break;
    case 'date':
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