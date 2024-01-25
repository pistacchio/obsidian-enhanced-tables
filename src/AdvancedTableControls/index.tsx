import React, { useEffect, useRef } from 'react';
import { AtcConfiguration, RawTableData } from 'src/utils/types';
import { useAdvancedTableControlsState } from 'src/AdvancedTableControls/useAdvancedTableControlsState';
import { PaginationView } from 'src/components/PaginationView';
import { ControlsView } from 'src/components/Controls';
import { App, MarkdownView } from 'obsidian';
import { TableManager } from 'src/TableManager';

type AdvancedTableControlsProps = {
  app: App;
  configuration: AtcConfiguration;
  tableData: RawTableData;
};

export const AdvancedTableControls: React.FC<AdvancedTableControlsProps> = ({
  app,
  configuration,
  tableData,
}) => {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

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
  } = useAdvancedTableControlsState(app, configuration, tableData);

  // Escape from React logic in order to be abel to use `HTMLElement.appendChild()` and
  // hence handle advanced formatters that return HTML elements
  useEffect(() => {
    if (!tbodyRef.current) {
      return;
    }

    tbodyRef.current!.innerHTML = '';

    console.log(rows);

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-atc-row', row.index.toString());

      row.orderedCells
        .filter((c) => !c.column.hidden)
        .forEach((cell, idx2) => {
          const td = document.createElement('td');
          tr.setAttribute('data-atc-cell', idx2.toString());
          tr.setAttribute('data-atc-row-cell', `${row.index}-${idx2}`);

          if (cell.column.nowrap) {
            td.className = 'advanced-table-controls-nowrap';
          }

          // If the formatter function returns a HTML element, use it as-is
          try {
            td.appendChild(cell.formattedValue);
          } catch (e) {
            td.innerHTML = cell.formattedValue;
          }

          // Editing. Activate it on click
          const onClickHandler = () => {
            console.log(cell.rawValue);
            td.innerHTML = cell.rawValue;
            td.setAttribute('contenteditable', 'true');

            td.removeEventListener('click', onClickHandler);
          };

          td.addEventListener('click', onClickHandler);

          // When the user is done editing, retrieve the current raw values from the
          // markdown table and change the current cell one
          td.addEventListener('blur', () => {
            const currentContent =
              app.workspace.getActiveViewOfType(MarkdownView)?.data ?? '';
            const tableManager = new TableManager();

            const modifiedRowValues = row.orderedCells.map((c, i) =>
              i === idx2 ? td.innerHTML : c.rawValue,
            );
            const modifiedContent = tableManager.modifyLine(
              currentContent,
              row.index,
              modifiedRowValues,
            );

            // Set the modified data

            // @ts-ignore
            app.workspace.getActiveFileView().setViewData(modifiedContent);

            // @ts-ignore
            app.workspace.activeEditor.previewMode.rerender();
          });

          tr.appendChild(td);
        });

      tbodyRef.current!.appendChild(tr);
    });
  }, [rows]);

  return (
    <div className="advanced-table-controls">
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {indexedColumns
                .filter((c) => !c.hidden)
                .map((c, idx) => (
                  <th
                    key={idx}
                    className={
                      c.nowrap ? 'advanced-table-controls-nowrap' : undefined
                    }
                    dangerouslySetInnerHTML={{ __html: c.name }}
                  />
                ))}
            </tr>
          </thead>

          <tbody ref={tbodyRef}></tbody>
        </table>
      </div>

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
