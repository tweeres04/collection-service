const functions = require('firebase-functions')
const admin = require('firebase-admin')
const mailgun = require('mailgun-js')

const { scrapeHTML } = require('scrape-it')
const cheerio = require('cheerio')
const axios = require('axios')
const querystring = require('querystring')
const { parse, isTomorrow, format } = require('date-fns')

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
})

exports.getAndStoreCollectionDatesHttps = functions.https.onRequest(
	async (req, res) => {
		const dates = await getNextCollectionDates()
		await storeDates(dates)
		res.sendStatus(204)
	}
)

exports.checkDatesAndSendEmailHttps = functions.https.onRequest(
	async (req, res) => {
		await checkDatesAndSendEmail()
		res.sendStatus(204)
	}
)

exports.checkDatesAndSendEmail = functions.pubsub
	.schedule('every day 08:00')
	.timeZone('America/Vancouver')
	.onRun(async () => {
		await checkDatesAndSendEmail()
	})

exports.getAndStoreCollectionDates = functions.pubsub
	.schedule('0 0 1,15 * *')
	.timeZone('America/Vancouver')
	.onRun(async () => {
		const dates = await getNextCollectionDates()
		await storeDates(dates)
	})

async function checkDatesAndSendEmail() {
	const snapshot = await admin.firestore().collection('dates').get()

	if (snapshot.empty) {
		throw 'No collection dates in database'
	}

	const promises = []
	snapshot.forEach((doc) => {
		async function go() {
			const nextCollectionDates = doc.data().dates.map((d) => d.toDate())

			console.log('nextCollectionDates', nextCollectionDates)

			const collectionDateToNotify = nextCollectionDates.find(isTomorrow)

			console.log('collectionDateToNotify', collectionDateToNotify)

			if (collectionDateToNotify) {
				const { email } = await admin.auth().getUser(doc.id)
				const mg = mailgun({
					apiKey: functions.config().mailgun.key,
					domain: functions.config().mailgun.domain,
				})
				const data = {
					from: 'Garbage Service Notification <garbage-service@tweeres.ca>',
					to: email,
					subject: 'Your garbage day is tomorrow',
					text: `Your next garbage is tomorrow: ${format(
						collectionDateToNotify,
						'eee MMM d, Y'
					)}`,
				}
				await mg.messages().send(data)

				console.log(`Sent email to ${email}`)
			}
		}

		promises.push(go())
	})

	await Promise.all(promises)
}

async function getNextCollectionDates() {
	const querySnapshot = await admin.firestore().collection('settings').get()

	const result = {}
	const promises = []

	querySnapshot.forEach((doc) => {
		async function go() {
			const address = doc.data()
			const { data } = await axios.post(
				'https://www.oakbay.ca/municipal-services/garbage-recycling/collection-service-schedule',
				querystring.stringify({
					action: 'lookup',
					street_number: address.houseNumber,
					street_name: address.streetName,
				})
			)
			const $ = cheerio.load(data)
			const dates = scrapeHTML($, {
				dates: { listItem: '.garbage-next-date' },
			}).dates.map((d) => parse(d, 'EEEE, MMMM, do', new Date()))

			console.log('Found dates', dates)

			result[doc.id] = dates
		}

		promises.push(go())
	})

	await Promise.all(promises)

	console.log(result)

	return result
}

function storeDates(dates) {
	const promises = []
	Object.keys(dates).forEach((address) => {
		const promise = admin
			.firestore()
			.doc(`dates/${address}`)
			.set({ dates: dates[address] })
		promises.push(promise)
	})

	return Promise.all(promises)
}
