import {
  AtcConfiguration,
  AtcConfigurationColumn,
  AtcDataCell,
  AtcDataColumn,
  AtcDataRow,
  Pagination,
  RawTableData,
} from 'src/utils/types';
import { useCallback, useMemo, useState } from 'react';

import {
  makeFormatterForColumn,
  parseNumberFormat,
} from 'src/utils/formatters';
import {
  DEFAULT_COLUMNS_TYPE,
  DEFAULT_DATE_FORMAT,
  DEFAULT_NUMBER_FORMAT,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGES_SIZE_OPTIONS,
} from 'src/utils/sharedConstants';
import { extractValue } from 'src/utils/values';
import { getSortingFunction } from 'src/utils/sorting';

import { PaginationOptions } from 'src/components/PaginationView';

export function useAdvancedTableControlsState(
  configuration: AtcConfiguration,
  tableData: RawTableData,
) {
  const [sorting, setSorting] = useState<string | null>(
    configuration.sort ?? null,
  );
  const [filtering, setFiltering] = useState<string | null>(
    configuration.filter ?? null,
  );
  const [pagination, setPagination] = useState<Pagination | null>(() => {
    if (configuration.pagination) {
      const pageSize =
        configuration.pagination['page-size'] ?? DEFAULT_PAGE_SIZE;
      const pageSizes =
        configuration.pagination['page-sizes'] ?? DEFAULT_PAGES_SIZE_OPTIONS;
      if (!pageSizes.contains(pageSize)) {
        pageSizes.push(pageSize);
        pageSizes.sort();
      }

      return {
        pageNumber: 1,
        pageSize,
        pageSizes,
      };
    }

    return null;
  });

  const [totalNumberOfUnpaginatedRows, setTotalNumberOfUnpaginatedRows] =
    useState<number>(tableData.rows.length);

  const onChangePagination = useCallback((p: PaginationOptions) => {
    setPagination((pagination) => ({ ...pagination, ...p }) as Pagination);
  }, []);

  const indexedColumns = useMemo<AtcDataColumn[]>(() => {
    const indexedColumns: AtcDataColumn[] = tableData.columns.map(
      (columnName, index) => {
        const name = columnName;
        const columnConfiguration = (configuration.columns?.[name] ??
          {}) as AtcConfigurationColumn;

        const { formatter, ...columnConfigurationData } = columnConfiguration;

        const columnData = {
          ...columnConfigurationData,
          alias: columnConfigurationData.alias || name,
          type: columnConfigurationData.type ?? DEFAULT_COLUMNS_TYPE,
          name,
          index,
          dateFormat: columnConfiguration['date-format'] ?? DEFAULT_DATE_FORMAT,
          numberFormat: parseNumberFormat(
            columnConfiguration['number-format'] ?? '',
            DEFAULT_NUMBER_FORMAT,
          ),
        } as AtcDataColumn;

        columnData.formatter = makeFormatterForColumn(columnData, formatter);

        return columnData;
      },
    );

    return indexedColumns;
  }, [tableData.columns, configuration.columns]);

  const rows = useMemo<AtcDataRow[]>(() => {
    const dateFormat = configuration['date-format'] ?? DEFAULT_DATE_FORMAT;

    let rows: AtcDataRow[] = tableData.rows.map((cells) => {
      let orderedCells: AtcDataCell[] = cells.map((cellContent, index) => {
        const value = extractValue(
          cellContent,
          indexedColumns[index],
          dateFormat,
        );

        return {
          column: indexedColumns[index],
          rawValue: cellContent,
          value,
          // formattedValue: indexedColumns[index].formatter(value),
        } as AtcDataCell;
      });

      const allCells = Object.fromEntries(
        orderedCells.map((c) => [c.column.alias, c.value]),
      );

      orderedCells = orderedCells.map((c, idx) => ({
        ...c,
        formattedValue: indexedColumns[idx].formatter(c.value, allCells),
      }));

      return {
        orderedCells,
        ...allCells,
      } as AtcDataRow;
    });

    setTotalNumberOfUnpaginatedRows(rows.length);

    // Sorting
    if (sorting) {
      const sortFn = getSortingFunction(sorting, indexedColumns);

      if (sortFn) {
        const sortField = sorting.startsWith('-') ? sorting.slice(1) : sorting;

        rows = rows.sort((a, b) => sortFn(a[sortField], b[sortField]));
      }
    }

    // Filtering
    if (filtering) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const $data = tableData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rows = rows.filter(($row) => eval(filtering));
    }

    // Pagination
    if (pagination) {
      rows = rows.slice(
        pagination.pageSize! * (pagination.pageNumber! - 1),
        pagination.pageSize! * pagination.pageNumber!,
      );
    }

    return rows;
  }, [
    filtering,
    indexedColumns,
    pagination,
    sorting,
    tableData,
    configuration,
  ]);

  return {
    indexedColumns,
    rows,

    pagination,
    onChangePagination,
    totalNumberOfUnpaginatedRows,

    filtering,
    setFiltering,

    sorting,
    setSorting,
  };
}
