import { createRouteHandler } from 'uploadthing/next'
import { uploadRouter } from '@/server/uploadthing'

export const { GET, POST } = createRouteHandler({
	router: uploadRouter,
	config: {
		token: process.env.UPLOADTHING_TOKEN as string,
	},
})
