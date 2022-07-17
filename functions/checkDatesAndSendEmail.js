const functions = require('firebase-functions')
const admin = require('firebase-admin')
const mailgun = require('mailgun-js')

const { isTomorrow, format } = require('date-fns')

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
					text: `Your next garbage day is tomorrow: ${format(
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
