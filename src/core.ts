import type { WorkBook, WritingOptions } from '@e965/xlsx'
import type { Buffer } from 'node:buffer'
import type { ESWContentType, ESWDefaultContentType, ESWJsonSheet, ESWOptions } from './types'
import { write as sWrite, writeFile as sWriteFile, utils } from '@e965/xlsx'
import { jsonSheetToWorkSheet } from './utils'

export function constructWorkbook<ContentType extends ESWContentType = ESWDefaultContentType>(jsonSheets: Array<ESWJsonSheet<ContentType>>, options: Omit<ESWOptions, 'fileName' | keyof WritingOptions> = {}): WorkBook {
  if (jsonSheets.length === 0)
    throw new Error('No sheets provided')

  const workbook = utils.book_new()
  jsonSheets.forEach((actualSheet, actualIndex) => {
    const worksheet = jsonSheetToWorkSheet(actualSheet, options)
    const worksheetName = actualSheet.sheet ?? `Sheet ${actualIndex + 1}`
    utils.book_append_sheet(workbook, worksheet, worksheetName)
  })

  const RTL = Boolean(options.RTL)
  workbook.Workbook ??= {}
  workbook.Workbook.Views ??= [{}]
  workbook.Workbook.Views.forEach((view) => {
    view.RTL = RTL
  })

  return workbook
}

export function write<O extends WritingOptions>(workbook: WorkBook, options?: O | undefined):
O['type'] extends 'buffer'
  ? (Uint8Array | Buffer)
  : O['type'] extends 'string' | 'base64' | 'binary'
    ? string
    : any {
  const resolvedOptions = resolveOptions(options)

  const data = sWrite(workbook, resolvedOptions)

  // Cast Buffer to Uint8Array for platform consistency?
  // if (options.type === 'buffer')
  //   data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)

  return data
}

export function writeFile(workbook: WorkBook, options?: Pick<ESWOptions, 'fileName' | keyof WritingOptions>): void {
  const resolvedOptions = resolveOptions(options)

  return sWriteFile(workbook, resolvedOptions.fileName, resolvedOptions)
}

// eslint-disable-next-line ts/explicit-function-return-type
function resolveOptions(options?: ESWOptions) {
  const rO = {
    ...options,
    bookType: options?.bookType ?? 'xlsx',
    fileName: options?.fileName ?? 'output',
    type: options?.type ?? 'buffer',
    compression: options?.compression ?? true,
  } satisfies ESWOptions

  const extIndex = rO.fileName.lastIndexOf('.')

  // If no existing extension found
  if (extIndex === -1)
    rO.fileName += `.${rO.bookType}`

  return rO
}
