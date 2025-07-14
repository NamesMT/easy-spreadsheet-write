import type { ColInfo, ESWColumn, ESWContentType, ESWDefaultContentType, ESWJsonSheet, ESWOptions, WorkSheet } from './types'
import { utils } from '@e965/xlsx'
import { objectGet } from '@namesmt/utils'

export { browserDownloadFile } from '@namesmt/utils'

export function defineJsonSheet<ContentType extends ESWDefaultContentType = ESWDefaultContentType>(jsonSheet: ESWJsonSheet<ContentType>): ESWJsonSheet<ContentType> {
  return jsonSheet
}

export const getRowPathValue = <ContentType = ESWDefaultContentType>(row: ContentType, path: string): any => objectGet(row, path) ?? ''

export function getJsonSheetRow<ContentType extends ESWContentType = ESWDefaultContentType>(row: ContentType, columns: ESWColumn<ContentType>[]): Record<string, any> {
  const jsonSheetRow: Record<string, any> = {}
  columns.forEach((col) => {
    const colValue = extractColumnValue(col)
    const colLabel = extractColumnLabel(col)
    if (typeof colValue === 'function') {
      jsonSheetRow[colLabel] = colValue(row)
    }
    else {
      jsonSheetRow[colLabel] = getRowPathValue(row, colValue)
    }
  })
  return jsonSheetRow
}

export function applyColumnFormat(worksheet: WorkSheet, columnIds: string[], columnFormats: Array<string | null>): void {
  for (let i = 0; i < columnIds.length; i += 1) {
    const columnFormat = columnFormats[i]

    // Skip column if it doesn't have a format
    if (!columnFormat) {
      continue
    }

    const column = utils.decode_col(columnIds[i])
    const range = utils.decode_range(worksheet['!ref'] ?? '')

    // Note: Range.s.r + 1 skips the header row
    for (let row = range.s.r + 1; row <= range.e.r; ++row) {
      const ref = utils.encode_cell({ r: row, c: column })

      if (worksheet[ref]) {
        switch (columnFormat) {
          case 'hyperlink':
            worksheet[ref].l = { Target: worksheet[ref].v }
            break
          default:
            worksheet[ref].z = columnFormat
        }
      }
    }
  }
}

export function getWorksheetColumnIds(worksheet: WorkSheet): string[] {
  const columnRange = utils.decode_range(worksheet['!ref'] ?? '')

  // Column letters present in the workbook, e.g. A, B, C
  const columnIds: string[] = []
  for (let C = columnRange.s.c; C <= columnRange.e.c; C++) {
    const address = utils.encode_col(C)
    columnIds.push(address)
  }

  return columnIds
}

export function getValueCellLength(object: unknown): number {
  if (typeof object === 'string') {
    return Math.max(...object.split('\n').map(string => string.length))
  }
  if (typeof object === 'number') {
    return object.toString().length
  }
  if (typeof object === 'boolean') {
    return object ? 'true'.length : 'false'.length
  }
  if (object instanceof Date) {
    return object.toString().length
  }
  return 0
}

export function getWorksheetColumnWidths(worksheet: WorkSheet, extraLength: number = 1): NonNullable<ColInfo['width']>[] {
  const columnLetters: string[] = getWorksheetColumnIds(worksheet)

  return columnLetters.map((column) => {
    // Cells that belong to this column
    const columnCells: string[] = Object.keys(worksheet).filter((cell) => {
      return cell.replace(/\d/g, '') === column
    })

    const maxWidthCell = columnCells.reduce((maxWidth, cellId) => {
      const cell = worksheet[cellId]

      const cellContentLength: number = getValueCellLength(cell.v)

      if (!cell.z) {
        return Math.max(maxWidth, cellContentLength)
      }

      const cellFormatLength: number = cell.z.length

      const largestWidth: number = Math.max(cellContentLength, cellFormatLength)

      return Math.max(maxWidth, largestWidth)
    }, 0)

    return maxWidthCell + extraLength
  })
}

export function jsonSheetToWorkSheet<ContentType extends ESWContentType = ESWDefaultContentType>(jsonSheet: ESWJsonSheet<ContentType>, options: Pick<ESWOptions, 'cellPadding' | 'RTL'>): WorkSheet {
  let jsonSheetRows: ReturnType<typeof getJsonSheetRow>[]

  if (jsonSheet.content.length > 0) {
    jsonSheetRows = jsonSheet.content.map((row) => {
      return getJsonSheetRow(row, jsonSheet.columns)
    })
  }
  else {
    // If there's no content, show only column labels
    jsonSheetRows = jsonSheet.columns.map(col => ({ [extractColumnLabel(col)]: '' }))
  }

  const worksheet = utils.json_to_sheet(jsonSheetRows)
  const worksheetColumnIds = getWorksheetColumnIds(worksheet)

  const worksheetColumnFormats = jsonSheet.columns.map(col => extractColumnFormat(col) ?? null)
  applyColumnFormat(worksheet, worksheetColumnIds, worksheetColumnFormats)

  worksheet['!cols'] = getWorksheetColumnWidths(worksheet, options.cellPadding)
    .map(width => ({ width }))

  return worksheet
}

export function extractColumnLabel(column: ESWColumn<any>): string {
  if (Array.isArray(column))
    return column[0]

  if (typeof column === 'object' && 'label' in column)
    return column.label

  throw new Error('Invalid column format')
}

export function extractColumnValue(column: ESWColumn<any>): string | ((row: any) => any) {
  if (Array.isArray(column))
    return column[1]

  if (typeof column === 'object' && 'value' in column)
    return column.value

  throw new Error('Invalid column format')
}

export function extractColumnFormat(column: ESWColumn<any>): string | null {
  return (column as any)?.format
}
