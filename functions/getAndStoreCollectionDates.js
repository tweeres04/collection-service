const { onRequest, onCall } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')

const { scrapeHTML } = require('scrape-it')
const cheerio = require('cheerio')
const axios = require('axios')
const querystring = require('querystring')
const { parse } = require('date-fns')

exports.getAndStoreCollectionDatesHttps = onRequest(async (req, res) => {
	const dates = await getNextCollectionDates()
	await storeDates(dates)
	res.sendStatus(204)
})

exports.refreshCollectionDatesForAddress = onCall(
	async ({ data, auth: { uid } }) => {
		const collectionDates = await getNextCollectionDatesForAddress(data)
		storeDates({ [uid]: collectionDates })
		return collectionDates.map((d) => d.toISOString())
	}
)

exports.getAndStoreCollectionDates = onSchedule(
	{
		schedule: '0 0 1,15 * *',
		timeZone: 'America/Vancouver',
	},
	async () => {
		try {
			const dates = await getNextCollectionDates()
			await storeDates(dates)
		} catch (err) {
			console.error(err.request)
		}
	}
)

async function getNextCollectionDatesForAddress({
	enabled,
	houseNumber,
	streetName,
}) {
	if (!enabled) {
		return []
	}

	const { data } = await axios.post(
		'https://www.oakbay.ca/municipal-services/garbage-recycling/collection-service-schedule',
		querystring.stringify({
			action: 'lookup',
			street_number: houseNumber,
			street_name: streetName,
		})
	)
	const $ = cheerio.load(data)
	const dates = scrapeHTML($, {
		dates: { listItem: '.garbage-next-date' },
	}).dates.map((d) => parse(d, 'EEEE, MMMM, do', new Date()))

	return dates
}

async function getNextCollectionDates(querySnapshot) {
	querySnapshot =
		querySnapshot || (await admin.firestore().collection('settings').get())

	const result = {}
	const promises = []

	querySnapshot.forEach((doc) => {
		async function go() {
			const settings = doc.data()

			if (settings.enabled === false) {
				result[doc.id] = []
				return
			}

			const dates = await getNextCollectionDatesForAddress(settings)

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
	Object.keys(dates).forEach((uid) => {
		const promise = admin
			.firestore()
			.doc(`dates/${uid}`)
			.set({ dates: dates[uid] })
		promises.push(promise)
	})

	return Promise.all(promises)
}
