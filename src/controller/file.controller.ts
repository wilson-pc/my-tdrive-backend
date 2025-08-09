import { TelegramClient } from '@mtcute/node'
import { Hono } from 'hono'
import { db } from '../db/index.js'
import { decrypt } from '../utils/encryptation.js'
import { isNumber } from '../utils/utils.js'


const fileRouter = new Hono()
const tg = new TelegramClient({
  apiId: 3454052,
  apiHash: 'cba31f242e6b16063f7db572fe388cb3'
})
fileRouter.get('download/:fileId', async (c) => {
  const fileId  = c.req.param("fileId")
  console.log(fileId)
  const rs = await db.execute({
    sql: 'SELECT * FROM files WHERE id = ?',
    args: [fileId]
  })

  const file = rs.rows[0]

  const userRs = await db.execute({
    sql: 'SELECT * FROM users WHERE externalId = ?',
    args: [file.userId]
  })

  const user = userRs.rows[0]
  const session = decrypt(user.serverSession)
     console.log(session)
  const self = await tg.start({ session: session })

  ///

      const peerId:any= isNumber(file?.chatId)?Number(file?.chatId ?? 0):file?.chatId

  const [msg] = await tg.getMessages(peerId, [Number(file?.messageId) ?? 0])
  const media = msg?.media as any

  const nodeStream = tg.downloadAsNodeStream(media)


// Replace the fileName line with:
const originalName:any = file?.name || 'download.mp4';
const textToAdd = '_av1'; // texto que quieres agregar
const fileName = encodeURIComponent(originalName.replace(/(\.[^.]+)?$/, textToAdd + '$&'));
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        // Asegurarse de que chunk sea un Uint8Array
        const buffer = Buffer.from(chunk)
        controller.enqueue(buffer)
      })
      nodeStream.on('end', () => {
        controller.close()
      })
      nodeStream.on('error', (err) => {
        controller.error(err)
      })
    }
  })

  return new Response(webStream, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
      'Content-Length': ""+file?.size+""
    }
  })
  return c.json({ message: 'otp code sended' })
})

export default fileRouter
