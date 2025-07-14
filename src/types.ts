import type { ColInfo, WorkBook, WorkSheet, WritingOptions } from '@e965/xlsx'

export type { ColInfo, WorkBook, WorkSheet, WritingOptions }

export type ESWContentType = NonNullable<unknown>

export type ESWDefaultContentType = ESWContentType

export interface ESWColumnObjectFormat<ContentType extends ESWContentType = ESWDefaultContentType> {
  /**
   * Column label.
   */
  label: string

  /**
   * Cell value
   *
   * A path to the value in the row object, or a function that takes the row and returns the value.
   */
  // TODO: automatically deeply infer available paths if possible, typed as `string` for now
  value: string | ((row: ContentType) => any)

  /**
   * Column formatting expression
   *
   * Refs:
   * + [SheetJS examples](https://git.sheetjs.com/sheetjs/sheetjs/src/commit/4495a9253e82eb54e5a97b83638974f158fa634c/bits/11_ssfutils.js)
   * + ECMA-376 number formatting specification
   *
   * Examples:
   * ```js
   * // Number formats
   * "$0.00" // Basic
   * "\£#,##0.00" // Pound
   * "0%" // Percentage
   * '#.# "ft"' // Number and text
   *
   * // Date formats
   * "d-mmm-yy" // 12-Mar-22
   * "ddd" // (eg. Sat)
   * "dddd" // (eg. Saturday)
   * "h:mm AM/PM" // 1:10 PM
   * ```
   */
  format?: string
}

export type ESWColumnArrayFormat<ContentType extends ESWContentType = ESWDefaultContentType> = [string, string | ((row: ContentType) => any)]

export type ESWColumn<ContentType extends ESWContentType = ESWDefaultContentType> = ESWColumnObjectFormat<ContentType> | ESWColumnArrayFormat<ContentType>

export interface ESWJsonSheet<ContentType extends ESWContentType = ESWDefaultContentType> {
  sheet?: string
  content: ContentType[]
  columns: ESWColumn<ContentType>[]
}

/**
 * The all-in-one options object that can be passed to any function
 */
export interface ESWOptions extends WritingOptions {
  fileName?: string
  /**
   * When writing, in formats that support styling, this increases the padding between the cell content and the cell border. (a.k.a: extra cell width)
   */
  cellPadding?: number
  /**
   * Right-to-left (RTL) mode
   */
  RTL?: boolean
}

/**
 * Internal type for writing options after defaults have been applied.
 */
export type ResolvedWritingOptions = WritingOptions & { type: string }
