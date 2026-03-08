import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export default defineEventHandler(async (event) => {
  try {
    console.log('Environment variables check:')
    console.log('NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY)
    console.log('NOTION_DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID)

    const databaseId = process.env.NOTION_DATABASE_ID

    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID is not set')
    }

    if (!process.env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY is not set')
    }

    console.log('Attempting to query database:', databaseId)

    const response = await notion.databases.query({
      database_id: databaseId,
    })

    console.log('Raw Notion response:')
    console.log(JSON.stringify(response, null, 2))

    console.log('Query successful, results count:', response.results.length)

    // データを整形して返す
    const results = response.results.map((page: any) => {
      const properties = page.properties

      return {
        id: page.id,
        title: properties.Title?.title?.[0]?.plain_text || 'Untitled',
        category: properties.Category?.select?.name || 'Career',
        specific: properties.Specific?.rich_text?.[0]?.plain_text || '',
        measurable: properties.Measurable?.rich_text?.[0]?.plain_text || '',
        achievable: properties.Achievable?.rich_text?.[0]?.plain_text || '',
        relevant: properties.Relevant?.rich_text?.[0]?.plain_text || '',
        timeBound: properties.TimeBound?.date?.start || '',
        startDate: properties.StartDate?.date?.start || '',
        targetYear: properties.TargetYear?.number || new Date().getFullYear(),
        status: properties.Status?.status?.name || 'Planning',
        progress: Math.round((properties.Progress?.rollup?.number || 0) * 100),
        yearPlans: [], // 後で実装
      }
    })

    return {
      success: true,
      data: results
    }
  } catch (error: any) {
    console.error('Notion API error details:')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error status:', error.status)
    console.error('Full error object:', error)

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch data from Notion: ${error.message || 'Unknown error'}`
    })
  }
})