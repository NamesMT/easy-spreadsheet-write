import type { BinaryLike } from 'node:crypto'
import { createHash } from 'node:crypto'
import { constructWorkbook, write } from '#src/index.js'

import { describe, expect, it } from 'vitest'

async function createSha256(data: BinaryLike) {
  const sha256 = createHash('sha256')
  sha256.update(data)
  return sha256.digest('base64url')
}

describe('fast smoke tests', () => {
  it('should work with basic usage', async () => {
    const workbook = constructWorkbook([
      {
        sheet: 'Sheet1',
        content: [
          { user: 'Luis', ghUsername: 'LuisEnMarroquin', likes: 99 },
        ],
        columns: [
          ['User name', 'user'], // Array syntax
          ['User name (lowercase)', row => row.user.toLowerCase()],
          { label: 'Likes count', value: 'likes' }, // Object syntax
          { label: 'GitHub URL', value: row => `https://github.com/${row.ghUsername}` },
        ],
      },
    ])

    const data = write(workbook, { bookType: 'ods' })

    expect(await createSha256(data)).toMatchInlineSnapshot(`"s78dsYvItMgwaznHWEV1QJh_vzTNSmM2mvbrKAJOoro"`)
  })
})
