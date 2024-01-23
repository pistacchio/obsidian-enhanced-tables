import React from 'react';
import { AtcConfiguration, AtcDataCell, RawTableData } from 'src/utils/types';
import { useAdvancedTableControlsState } from 'src/AdvancedTableControls/useAdvancedTableControlsState';
import { PaginationView } from 'src/components/PaginationView';
import { ControlsView } from 'src/components/Controls';

type AdvancedTableControlsProps = {
  configuration: AtcConfiguration;
  tableData: RawTableData;
};

export const AdvancedTableControls: React.FC<AdvancedTableControlsProps> = ({
  configuration,
  tableData,
}) => {
  const {
    indexedColumns,
    rows,

    pagination,
    onChangePagination,
    totalNumberOfUnpaginatedRows,

    filtering,
    setFiltering,

    sorting,
    setSorting,
  } = useAdvancedTableControlsState(configuration, tableData);

  return (
    <div>
      {!configuration['hide-controls'] && (
        <ControlsView
          configuration={configuration}
          columns={indexedColumns}
          filtering={filtering}
          setFiltering={setFiltering}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}

      <table>
        <thead>
          <tr>
            {indexedColumns
              .filter((c) => !c.hidden)
              .map((c, idx) => (
                <th key={idx} dangerouslySetInnerHTML={{ __html: c.name }} />
              ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {r.orderedCells
                .filter((c: AtcDataCell) => !c.column.hidden)
                .map((c: AtcDataCell, idx2: number) => (
                  <td
                    className={
                      c.column.nowrap
                        ? 'advanced-table-controls-nowrap'
                        : undefined
                    }
                    key={idx2}
                    dangerouslySetInnerHTML={{ __html: c.formattedValue }}
                  />
                ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <PaginationView
          value={pagination}
          onChange={onChangePagination}
          totalNumberOfItems={totalNumberOfUnpaginatedRows}
          pageSizeOptions={pagination.pageSizes}
        />
      )}
    </div>
  );
};
