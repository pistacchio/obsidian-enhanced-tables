import { EtDataColumn } from 'src/utils/types';

export type SortFunction = (a: any, b: any) => number;

export function getSortingFunction(
  sortField: string,
  columns: EtDataColumn[],
): SortFunction | null {
  const desc = sortField.startsWith('-');
  if (desc) {
    sortField = sortField.slice(1);
  }

  const column = columns.find((c) => c.alias === sortField);

  if (!column) {
    return null;
  }

  switch (column.type) {
    case 'number':
    case 'bool':
      if (desc) {
        return (a, b) => (b ?? 0) - (a ?? 0);
      }

      return (a, b) => (a ?? 0) - (b ?? 0);
      break;
    case 'date':
    case 'datetime':
    case 'time':
      if (desc) {
        return (a, b) => {
          if (!a && !b) {
            return 0;
          }
          if (!a) {
            return -1;
          }
          if (!b) {
            return 1;
          }

          return b.diff(a);
        };
      }

      return (a, b) => {
        if (!a && !b) {
          return 0;
        }
        if (!a) {
          return 1;
        }
        if (!b) {
          return -1;
        }

        return a.diff(b);
      };

      break;
    default:
      if (desc) {
        return (a, b) => (b ?? '').localeCompare(a ?? '');
      }

      return (a, b) => (a ?? '').localeCompare(b ?? '');
  }
}
