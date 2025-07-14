<div align="center">

<h1>Easy Spreadsheet Write</h1>

<h3>Easy UX/DX for creating spreadsheet files!</h3>
<img src="./branding.svg" alt="Project's branding image" width="320"/>

</div>

# easy-spreadsheet-write ![TypeScript heart icon](https://img.shields.io/badge/♡-%23007ACC.svg?logo=typescript&logoColor=white)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![Bundlejs][bundlejs-src]][bundlejs-href]
[![TypeDoc][TypeDoc-src]][TypeDoc-href]

* [easy-spreadsheet-write ](#easy-spreadsheet-write-)
  * [Overview](#overview)
  * [Features](#features)
  * [Usage](#usage)
    * [Install package](#install-package)
    * [Import and use](#import-and-use)
  * [Notes](#notes)
    * [Sheets type inference constraint / limitation](#sheets-type-inference-constraint--limitation)
    * [Fork notice and credit](#fork-notice-and-credit)
  * [License](#license)

## Overview

**easy-spreadsheet-write**'s main goal is to help you easily create spreadsheet files, with modern DX and type safety.

This package currently wraps on top of [sheetjs](https://sheetjs.com/) to provide the functionalities.

## Features

+ 👌 TypeScript

## Usage

### Install package

```sh
# npm
npm install easy-spreadsheet-write

# bun
bun add easy-spreadsheet-write

# pnpm
pnpm install easy-spreadsheet-write
```

### Import and use

```ts
// ESM
import { constructWorkbook, ESWOptions, write, writeFile } from 'easy-spreadsheet-write'

const options = {
  fileName: 'MyODS', // extension will be added automatically if not provided
  cellPadding: 3, // In formats that support styling, this is the padding between the cell contents and the cell border.
  RTL: undefined, // Display the columns from right-to-left (defaults `false`)

  // ...sheetjsOptions, // Write options of sheetjs: https://docs.sheetjs.com/docs/api/write-options
  bookType: 'ods', // Defaults to 'xlsx'
} satisfies ESWOptions

const workbook = constructWorkbook(
  [
    {
      sheet: 'Sheet1',
      content: [
        { user: 'Luis', ghUsername: 'LuisEnMarroquin', likes: 99 },
      ],
      // The resolver function `row => ...` will automatically infer the type from `content`
      columns: [
        ['User name', 'user'], // Array syntax
        ['User name (lowercase)', row => row.user.toLowerCase()],
        { label: 'Likes count', value: 'likes' }, // Object syntax
        { label: 'GitHub URL', value: row => `https://github.com/${row.ghUsername}` },
      ],
    },
  ],
  options
)

// Similar to SheetJS's writeFile, this will write the file to disk / trigger a browser download
writeFile(data, options)

// There is a `browserDownloadFile` helper in case you need to defer the download:
const ssData = write(data, options)
// You'll have to construct a File object and provide the fileName with extension.
browserDownloadFile(new File([ssData], 'fileName.ext'))
```

## Notes

### Sheets type inference constraint / limitation

If you use multiple sheets, or you want to constraint the type of the sheet, follow this example:
```ts
// Set `<any>` for constructWorkbook to allow different types for the sheets
const workbook = constructWorkbook<any>(
  [
    // Use `defineJsonSheet` to define the sheets
    defineJsonSheet({
      sheet: 'Sheet1',
      content: [
        { what: 'wut' },
      ],
      columns: [
        ['What', 'what'],
      ],
    }),
    defineJsonSheet({
      sheet: 'Sheet2',
      content: [
        '{"encoded":"sample"}',
      ],
      columns: [
        ['Subject type', row => JSON.parse(row).type],
      ],
    }),
  ],
)
```

### Fork notice and credit

`easy-spreadsheet-write` is a fork of [`json-as-xlsx`](https://github.com/LuisEnMarroquin/json-as-xlsx), which I've been using for a while, but it is a bit outdated and the DX isn't as modern as it could be, so I clicked the fork button, heavily rewrite it, updating the toolchain to modern standards, improving the types, adding features, and a new package name which better describes it.

Shoutout to Luis for the original work, I'd love to get this merged to upstream, will open a PR but idk if it would be accepted.

## License

[![License][license-src]][license-href]

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/easy-spreadsheet-write?labelColor=18181B&color=F0DB4F
[npm-version-href]: https://npmjs.com/package/easy-spreadsheet-write
[npm-downloads-src]: https://img.shields.io/npm/dm/easy-spreadsheet-write?labelColor=18181B&color=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/easy-spreadsheet-write
[codecov-src]: https://img.shields.io/codecov/c/gh/namesmt/easy-spreadsheet-write/main?labelColor=18181B&color=F0DB4F
[codecov-href]: https://codecov.io/gh/namesmt/easy-spreadsheet-write
[license-src]: https://img.shields.io/github/license/namesmt/easy-spreadsheet-write.svg?labelColor=18181B&color=F0DB4F
[license-href]: https://github.com/namesmt/easy-spreadsheet-write/blob/main/LICENSE
[bundlejs-src]: https://img.shields.io/bundlejs/size/easy-spreadsheet-write?labelColor=18181B&color=F0DB4F
[bundlejs-href]: https://bundlejs.com/?q=easy-spreadsheet-write
[jsDocs-src]: https://img.shields.io/badge/Check_out-jsDocs.io---?labelColor=18181B&color=F0DB4F
[jsDocs-href]: https://www.jsdocs.io/package/easy-spreadsheet-write
[TypeDoc-src]: https://img.shields.io/badge/Check_out-TypeDoc---?labelColor=18181B&color=F0DB4F
[TypeDoc-href]: https://namesmt.github.io/easy-spreadsheet-write/
