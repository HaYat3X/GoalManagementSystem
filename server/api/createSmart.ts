import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY
})

export default defineEventHandler(async (event) => {

  const body = await readBody(event)

  const databaseId = process.env.NOTION_DATABASE_ID

  if (!databaseId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database ID not set'
    })
  }

  const response = await notion.pages.create({
    parent: {
      database_id: databaseId
    },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: body.title || 'New Goal'
            }
          }
        ]
      },

      Category: {
        select: {
          name: body.category || 'Career'
        }
      },

      Status: {
        status: {
          name: 'Planning'
        }
      },

      TargetYear: {
        number: body.targetYear || new Date().getFullYear()
      }
    }
  })

  return {
    success: true,
    id: response.id
  }
})