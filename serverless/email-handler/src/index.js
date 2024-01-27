import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses";

const MY_EMAIL = 'hello@miko.art'

const corsHeaders = new Headers({
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Origin': '*'
})

const sesClient = new SESClient({
	region: 'us-east-1',
	credentials: {
		accessKeyId: 'AKIATOEGPMJXWTCUMFUR',
		secretAccessKey: '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'
	}
})

/**
 *
 * @param request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
	const {name = "", email, message = ""} = await request.json()

	try {
		const {status} = await sesClient.send(new SendEmailCommand({
			Source: `${name} <${MY_EMAIL}>`,
			FromEmailAddress: email,
			Destination: {
				ToAddresses: [MY_EMAIL]
			},
			ReplyToAddresses: [email],
			Message: {
				Body: {
					Text: {
						Charset: "UTF-8",
						Data: message
					}
				},
				Subject: {
					Charset: "UTF-8",
					Data: `Miko.art: Contact`
				}
			}
		}))

		return new Response(`SES responded okay ${status}`, {
			status: 200,
			headers: corsHeaders
		})
	} catch (error) {
		return new Response(error, {
			status: 500,
			headers: corsHeaders
		})
	}
}

addEventListener('fetch', event => {
	switch (event.request.method) {
		case 'POST':
			event.respondWith(
				handleRequest(event.request)
			)
			break

		case 'OPTIONS':
			event.respondWith(
				new Response(null, {
					status: 200,
					headers: corsHeaders
				})
			)
			break

		default:
			event.respondWith(
				new Response('Bad Request', {
					status: 400,
					headers: corsHeaders
				})
			)
			break
	}
})