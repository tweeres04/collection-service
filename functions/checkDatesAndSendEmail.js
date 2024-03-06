const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Mailgun = require('mailgun.js')
const formData = require('form-data')

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

exports.sendTestEmail = functions.https.onCall(sendTestEmail)

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

			let collectionDateToNotify = nextCollectionDates.find(isTomorrow)

			console.log('collectionDateToNotify', collectionDateToNotify)

			if (collectionDateToNotify) {
				const { email } = await admin.auth().getUser(doc.id)
				collectionDateToNotify = format(
					collectionDateToNotify,
					'eee MMM d, Y'
				)
				const shareLink =
					Math.random() > 0.33
						? `\n\nKnow someone who could use these notifications? Send them here to get set up: https://oakbaygarbagenotifications.tweeres.ca/?utm_source=email&utm_medium=referral&utm_campaign=email_referrals&utm_content=${email}`
						: '\n\nGot feedback about this service? Just reply to this email!'
				await sendEmail({
					email,
					subject: 'Your garbage day is tomorrow',
					text: `Your next garbage day is tomorrow: ${collectionDateToNotify}${shareLink}`,
					tags: ['OBGCN'],
				})
				console.log(`Sent email to ${email}`)
			}
		}

		promises.push(go())
	})

	await Promise.all(promises)
}

async function sendTestEmail({ email, collectionDateToNotify }) {
	await sendEmail({
		email,
		subject: 'Test Email',
		text: `Your next garbage day is ${collectionDateToNotify}`,
		tags: ['OBGCN - Test Email'],
	})
	console.log(`Sent test email to ${email}`)
}

async function sendEmail({ email, subject, text, tags = [] }) {
	const mailgun = new Mailgun(formData)
	const mg = mailgun.client({
		username: 'api',
		key: functions.config().mailgun.key,
	})
	const data = {
		from: 'Garbage Service Notification <garbage-service@tweeres.ca>',
		to: email,
		subject,
		text,
		'h:Reply-To': 'tweeres04@gmail.com',
		'o:tag': tags,
	}

	await mg.messages.create(functions.config().mailgun.domain, data)
}
