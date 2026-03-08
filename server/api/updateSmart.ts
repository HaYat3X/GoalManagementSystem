// import { Client } from '@notionhq/client'

// const notion = new Client({
//   auth: process.env.NOTION_API_KEY
// })

// export default defineEventHandler(async (event) => {
//   const body = await readBody(event)

//   const { id, field, value } = body

//   const propertyMap: Record<string, any> = {
//     title: {
//       Title: {
//         title: [
//           {
//             text: {
//               content: value
//             }
//           }
//         ]
//       }
//     },
//     specific: {
//       Specific: {
//         rich_text: [
//           {
//             text: {
//               content: value
//             }
//           }
//         ]
//       }
//     },
//     measurable: {
//       Measurable: {
//         rich_text: [
//           {
//             text: {
//               content: value
//             }
//           }
//         ]
//       }
//     },
//     achievable: {
//       Achievable: {
//         rich_text: [
//           {
//             text: {
//               content: value
//             }
//           }
//         ]
//       }
//     },
//     relevant: {
//       Relevant: {
//         rich_text: [
//           {
//             text: {
//               content: value
//             }
//           }
//         ]
//       }
//     },
//     timeBound: {
//       TimeBound: {
//         date: {
//           start: value
//         }
//       }
//     },
//     startDate: {
//       StartDate: {
//         date: {
//           start: value
//         }
//       }
//     },
//     targetYear: {
//       TargetYear: {
//         number: Number(value)
//       }
//     },
//     status: {
//       Status: {
//         select: {
//           name: value
//         }
//       }
//     }
//   }

//   const properties = propertyMap[field]

//   if (!properties) {
//     throw createError({
//       statusCode: 400,
//       statusMessage: 'Unsupported field'
//     })
//   }

//   await notion.pages.update({
//     page_id: id,
//     properties
//   })

//   return { success: true }
// })

import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY
})

export default defineEventHandler(async (event) => {

  const body = await readBody(event)

  const { id, field, value } = body

  const propertyMap: any = {

    title: {
      Title: {
        title: [
          {
            text: {
              content: value
            }
          }
        ]
      }
    },

    specific: {
      Specific: {
        rich_text: [
          {
            text: {
              content: value
            }
          }
        ]
      }
    },

    measurable: {
      Measurable: {
        rich_text: [
          {
            text: {
              content: value
            }
          }
        ]
      }
    },

    achievable: {
      Achievable: {
        rich_text: [
          {
            text: {
              content: value
            }
          }
        ]
      }
    },

    relevant: {
      Relevant: {
        rich_text: [
          {
            text: {
              content: value
            }
          }
        ]
      }
    },

    timeBound: {
      TimeBound: {
        date: {
          start: value
        }
      }
    },

    startDate: {
      StartDate: {
        date: {
          start: value
        }
      }
    },

    targetYear: {
      TargetYear: {
        number: Number(value)
      }
    },

    status: {
      Status: {
        status: {
          name: value
        }
      }
    },

    category: {
      Category: {
        select: {
          name: value
        }
      }
    }

  }

  const properties = propertyMap[field]

  if (!properties) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported field'
    })
  }

  await notion.pages.update({
    page_id: id,
    properties
  })

  return {
    success: true
  }

})