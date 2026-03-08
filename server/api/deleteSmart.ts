import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { ids } = body

  if (!ids || !Array.isArray(ids)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ids required'
    })
  }

  try {
    for (const id of ids) {
      await notion.pages.update({
        page_id: id,
        archived: true
      })
    }

    return {
      success: true
    }
  } catch (error: any) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete'
    })
  }
})