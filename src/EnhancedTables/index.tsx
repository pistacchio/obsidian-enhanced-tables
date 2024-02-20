import React, { useEffect, useMemo, useRef } from 'react';
import { EtConfiguration, RawTableData } from 'src/utils/types';
import { useEnhancedTablesState } from 'src/EnhancedTables/useEnhancedTablesState';
import { PaginationView } from 'src/EnhancedTables/components/PaginationView';
import { ControlsView } from 'src/EnhancedTables/components/Controls';
import { App, MarkdownView } from 'obsidian';
import { TableManager } from 'src/TableManager';
import { makeEditor } from 'src/EnhancedTables/editors';

import * as css from 'css';

type EnhancedTablesProps = {
  app: App;
  configuration: EtConfiguration;
  tableData: RawTableData;
  indexOfTheEnhancedTable: number;
};

export const EnhancedTables: React.FC<EnhancedTablesProps> = ({
  app,
  configuration,
  tableData,
  indexOfTheEnhancedTable,
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

    searching,
    setSearching,
  } = useEnhancedTablesState(
    app,
    configuration,
    indexOfTheEnhancedTable,
    tableData,
  );

  // Escape from React logic in order to be abel to use `HTMLElement.appendChild()` and
  // hence handle advanced formatters that return HTML elements
  useEffect(() => {
    if (!tbodyRef.current) {
      return;
    }

    tbodyRef.current!.textContent = '';

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-et-row', row.index.toString());

      const currentContent =
        app.workspace.getActiveViewOfType(MarkdownView)?.data ?? '';
      const tableManager = new TableManager();

      row.orderedCells
        .filter((c) => !c.column.hidden)
        .forEach((cell, idx2) => {
          const td = document.createElement('td');
          tr.setAttribute('data-et-cell', idx2.toString());
          tr.setAttribute('data-et-row-cell', `${row.index}-${idx2}`);

          if (cell.column.nowrap) {
            td.className = 'enhanced-tables-nowrap';
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
              indexOfTheEnhancedTable,
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
            td.classList.add('editor-cursor-pointer');
          }

          tr.appendChild(td);
        });

      tbodyRef.current!.appendChild(tr);
    });
  }, [indexOfTheEnhancedTable, app.workspace, configuration, rows]);

  // If the user defined a custom make, try to make it scoped to the class
  // enhanced-tables
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
        .enhanced-tables {
          ${css.stringify(customCss)}
        }
      `;
    } catch (e) {
      return undefined;
    }
  }, [configuration.style]);

  return (
    <div className="enhanced-tables">
      {style && <style>{style}</style>}

      {!configuration['hide-controls'] && (
        <ControlsView
          configuration={configuration}
          columns={indexedColumns}
          filtering={filtering}
          setFiltering={setFiltering}
          sorting={sorting}
          setSorting={setSorting}
          searching={searching}
          setSearching={setSearching}
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
                    className={`${c.nowrap ? 'enhanced-tables-nowrap' : ''} ${configuration['fix-header'] ? 'enhanced-tables-fix-header' : ''}`}
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
