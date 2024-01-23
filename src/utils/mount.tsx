import { MarkdownPostProcessorContext, parseYaml } from 'obsidian';
import {
  ATC_RENDER_TABLE_ATTRIBUTE,
  ATC_YAML_SIGNAL,
} from 'src/utils/sharedConstants';
import { AtcConfiguration, RawTableData } from 'src/utils/types';
import { AdvancedTableControls } from 'src/AdvancedTableControls';
import { createRoot } from 'react-dom/client';
import React from 'react';

export async function getMountContext(
  element: HTMLElement,
  ctx: MarkdownPostProcessorContext,
): Promise<
  [HTMLElement, AtcConfiguration, HTMLTableElement, RawTableData] | null
> {
  // The timeout is necessary to give Obsidian time to render the whole page
  // or else it would be impossible to find the table (since that would not
  // have been rendered yet(
  return new Promise((resolve) => {
    setTimeout(() => {
      let yamlCodeEl = element.find('code.language-yaml');
      let tableEl = element.find('table') as HTMLTableElement;

      // Neither a <code> or a <table> element. No need to continue
      if (!yamlCodeEl && !tableEl) {
        return resolve(null);
      }

      // Since the plugin can be triggered from either changes to the table or
      // changes to the yaml code, make sure that the yaml code configuration has
      // a table after it or that the table has a yaml code before it
      if (yamlCodeEl && !tableEl) {
        const tableElement = lookDownForTheTable(element);

        if (tableElement) {
          tableEl = tableElement;
        }
      }

      if (tableEl && !yamlCodeEl) {
        const yamlCodeElement = lookUpForTheYamlCode(element);
        if (yamlCodeElement) {
          yamlCodeEl = yamlCodeElement;
        }
      }

      // <code> not followed by <table> or a <table> not preceded by <code>
      if (!tableEl || !yamlCodeEl) {
        return resolve(null);
      }

      const configuration = extractYamlCodeFromTheCodeBlock(yamlCodeEl, ctx);

      if (!configuration) {
        return resolve(null);
      }

      const tableData = extractRawTableData(tableEl);

      return resolve([yamlCodeEl, configuration, tableEl, tableData]);
    }, 0);
  });
}

export function mountAdvancedTableControls(
  yamlCodeEl: HTMLElement,
  configuration: AtcConfiguration,
  tableEl: HTMLTableElement,
  tableData: RawTableData,
) {
  Array.from(
    document.querySelectorAll(`div[${ATC_RENDER_TABLE_ATTRIBUTE}]`),
  ).forEach((e) => e.remove());

  const rootElement = document.createElement('div');
  rootElement.setAttribute(ATC_RENDER_TABLE_ATTRIBUTE, 'true');
  tableEl.after(rootElement);
  tableEl.className = 'advanced-table-controls-hidden';

  if (configuration['hide-configuration']) {
    yamlCodeEl.parentElement?.remove();
  }

  createRoot(rootElement).render(
    <AdvancedTableControls
      configuration={configuration}
      tableData={tableData}
    />,
  );
}

function extractYamlCodeFromTheCodeBlock(
  yamlCodeEl: HTMLElement,
  ctx: MarkdownPostProcessorContext,
): AtcConfiguration | null {
  try {
    const sectionInfo = ctx.getSectionInfo(yamlCodeEl);
    const pageLines = sectionInfo?.text.split('\n');

    if (!pageLines?.[sectionInfo!.lineStart].startsWith(ATC_YAML_SIGNAL)) {
      return null;
    }

    const yamlCode = pageLines
      ?.slice(sectionInfo!.lineStart + 1, sectionInfo?.lineEnd)
      ?.join('\n');

    const yamlObj = yamlCode ? parseYaml(yamlCode) : null;

    return yamlObj as AtcConfiguration;
  } catch (e) {
    console.error('Cannot parse the yaml configuration');
    console.error(e);
    return null;
  }
}

function lookDownForTheTable(element: HTMLElement): HTMLTableElement | null {
  function recurseFindTable(element: Element): Element | null {
    if (element.tagName?.toUpperCase() === 'TABLE') {
      return element;
    }

    for (const child of Array.from(element.children)) {
      const foundTable = recurseFindTable(child);
      if (foundTable) {
        return foundTable;
      }
    }

    return null;
  }

  let nextSibling = element.nextSibling;
  while (nextSibling) {
    const foundTable = recurseFindTable(nextSibling as Element);
    if (foundTable) {
      return foundTable as HTMLTableElement;
    }
    nextSibling = nextSibling.nextSibling;
  }

  return null;
}

function lookUpForTheYamlCode(element: HTMLElement): HTMLElement | null {
  function recurseFindYamlCode(element: Element): Element | null {
    if (element.tagName?.toUpperCase() === 'CODE') {
      return element;
    }

    for (const child of Array.from(element.children)) {
      const foundTable = recurseFindYamlCode(child);
      if (foundTable) {
        return foundTable;
      }
    }

    return null;
  }

  let previousSibling = element.previousSibling;
  while (previousSibling) {
    const foundYamlCode = recurseFindYamlCode(previousSibling as Element);
    if (foundYamlCode) {
      return foundYamlCode as HTMLTableElement;
    }
    previousSibling = previousSibling.nextSibling;
  }

  return null;
}

function extractRawTableData(element: HTMLTableElement): RawTableData {
  const columns = (element.findAll('thead > tr > th') ?? []).map(
    (cell) => cell.innerHTML,
  );

  const rows = (element.findAll('tbody > tr') ?? []).map(
    (row: HTMLTableRowElement) => {
      return row
        .findAll('td')
        .map((cell: HTMLTableCellElement) => cell.innerHTML);
    },
  );

  return { columns, rows };
}
