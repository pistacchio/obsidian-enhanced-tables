import React, { useEffect, useMemo, useRef } from 'react';
import { AtcConfiguration, RawTableData } from 'src/utils/types';
import { useAdvancedTableControlsState } from 'src/AdvancedTableControls/useAdvancedTableControlsState';
import { PaginationView } from 'src/components/PaginationView';
import { ControlsView } from 'src/components/Controls';
import { App, MarkdownView } from 'obsidian';
import { TableManager } from 'src/TableManager';
import { makeEditor } from 'src/AdvancedTableControls/editors';

import * as css from 'css';

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

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-atc-row', row.index.toString());

      const currentContent =
        app.workspace.getActiveViewOfType(MarkdownView)?.data ?? '';
      const tableManager = new TableManager();

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
          const onValueChange = (newVal: string) => {
            const modifiedRowValues = row.orderedCells.map((c, i) =>
              i === idx2 ? newVal : c.rawValue,
            );
            const modifiedContent = tableManager.modifyLine(
              currentContent,
              row.index,
              modifiedRowValues,
            );

            // Set the modified data
            app.workspace
              // @ts-ignore
              .getActiveFileView()
              .setViewData(modifiedContent, true);

            // @ts-ignore
            app.workspace.activeEditor.previewMode.rerender();
          };

          if (cell.column.editable) {
            makeEditor(td, cell, configuration, onValueChange);
            td.style.cursor = 'pointer';
          }

          tr.appendChild(td);
        });

      tbodyRef.current!.appendChild(tr);
    });
  }, [app.workspace, configuration, rows]);

  // If the user defined a custom make, try to make it scoped to the class
  // advanced-table-controls
  const style = useMemo<string | undefined>(() => {
    if (!configuration.style) {
      return undefined;
    }

    try {
      const customCss = css.parse(configuration.style);
      customCss?.stylesheet?.rules.forEach((r) => {
        if ('selectors' in r) r.selectors = r.selectors?.map((s) => `& ${s}`);
      });

      return `
        .advanced-table-controls {
          ${css.stringify(customCss)}
        }
      `;
    } catch (e) {
      return undefined;
    }
  }, []);

  return (
    <div className="advanced-table-controls">
      {style && <style>{style}</style>}

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
                    className={`${c.nowrap ? 'advanced-table-controls-nowrap' : ''} ${configuration['fix-header'] ? 'advanced-table-controls-fix-header' : ''}`}
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
