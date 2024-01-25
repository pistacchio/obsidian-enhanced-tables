const SUB_HEADER_LINE_REGEX = /^\|\s*-[-\s|]*?-\s*\|$/gm;
const LINE_REGEX = /^\|.*?\|$/gm;

export type LineValues = string[];

class TableDocument {
  tableLines: string[] = [];
  contentBeforeTable: string = '';
  contentAfterTable: string = '';
  foundTable: boolean = false;

  constructor(fileContent: string) {
    const tableDocument = TableDocument.documentToTable(fileContent);
    if (!tableDocument) {
      return;
    }

    const [contentBeforeTable, tableLines, contentAfterTable] = tableDocument;

    this.tableLines = tableLines;
    this.contentBeforeTable = contentBeforeTable;
    this.contentAfterTable = contentAfterTable;

    this.foundTable = true;
  }

  public toString() {
    return `${this.contentBeforeTable}\n${this.tableLines.join('\n')}\n${this.contentAfterTable}`;
  }

  private static documentToTable(
    fileContent: string,
  ): [string, string[], string] | null {
    const lines = fileContent.split('\n');

    let startingLine: number | null = null;
    let endLine: number | null = null;

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo];

      // If a table first line hasn't been found yet, check if the line is a header-type
      // line and save its index
      if (startingLine === null && line.match(LINE_REGEX)) {
        startingLine = lineNo;
        continue;
      }

      // If this is the line after a table first line, check if it matches the expected
      // format (that is like | ---- | ---- |) or reset the found first line
      if (
        startingLine !== null &&
        lineNo === startingLine + 1 &&
        !line.match(SUB_HEADER_LINE_REGEX)
      ) {
        startingLine = null;
        continue;
      }

      // If we are within a table context but the current line is not a table line,
      // return the table lines
      if (startingLine !== null) {
        if (!line.match(LINE_REGEX)) {
          endLine = lineNo;
          break;
        }
      }
    }

    // All the lines scanned. If a table has been found, return all the lines from the
    // firs one to the last one.
    if (startingLine !== null) {
      return [
        lines.slice(0, startingLine).join('\n'),
        lines.slice(startingLine, endLine ?? undefined),
        endLine ? lines.slice(endLine).join('\n') : '',
      ];
    }

    return null;
  }
}

export class TableManager {
  public insertLine(
    fileContent: string,
    lineNo: number,
    values: LineValues,
  ): string {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.foundTable) {
      return fileContent;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableDocument.tableLines.length;
    }

    tableDocument.tableLines.splice(targetLineNo, 0, this.valuesToLine(values));

    return tableDocument.toString();
  }

  public modifyLine(
    fileContent: string,
    lineNo: number,
    values: LineValues,
  ): string {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.foundTable) {
      return fileContent;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableDocument.tableLines.length;
    }

    if (!tableDocument.tableLines.hasOwnProperty(targetLineNo)) {
      return fileContent;
    }

    tableDocument.tableLines[lineNo + 2] = this.valuesToLine(values);

    return tableDocument.toString();
  }

  public modifyHeader(fileContent: string, values: LineValues): string {
    return this.modifyLine(fileContent, -2, values);
  }

  public removeLine(fileContent: string, lineNo: number): string {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.foundTable) {
      return fileContent;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableDocument.tableLines.length;
    }

    tableDocument.tableLines.splice(targetLineNo, 1);

    return tableDocument.toString();
  }

  public readLine(fileContent: string, lineNo: number): LineValues | null {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.foundTable) {
      return null;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableDocument.tableLines.length;
    }

    const line = tableDocument.tableLines.at(targetLineNo);

    if (line) {
      return this.lineToValues(line);
    }

    return null;
  }

  public readTableLines(fileContent: string): LineValues[] | null {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.foundTable) {
      return null;
    }

    return tableDocument.tableLines.map((l) => this.lineToValues(l));
  }

  private valuesToLine(values: LineValues): string {
    return `|${values.map((v) => v.trim()).join('|')}|`;
  }

  private lineToValues(line: string): LineValues {
    return line.replace(/^\|/, '').replace(/\|$/, '').split('|');
  }
}
