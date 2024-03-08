const { onRequest, onCall } = require('firebase-functions/v2/https')
const { defineString, defineSecret } = require('firebase-functions/params')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')
const Mailgun = require('mailgun.js')
const formData = require('form-data')

const { isTomorrow, format } = require('date-fns')

const mailgunKey = defineSecret('MAILGUN_KEY')
const mailgunDomain = defineString('MAILGUN_DOMAIN')

exports.checkDatesAndSendEmailHttps = onRequest(
	{ secrets: [mailgunKey] },
	async (req, res) => {
		await checkDatesAndSendEmail()
		res.sendStatus(204)
	}
)

exports.checkDatesAndSendEmail = onSchedule(
	{
		schedule: 'every day 08:00',
		timeZone: 'America/Vancouver',
		secrets: [mailgunKey],
	},
	async () => {
		await checkDatesAndSendEmail()
	}
)

exports.sendTestEmail = onCall({ secrets: [mailgunKey] }, sendTestEmail)

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

async function sendTestEmail({ data: { email, collectionDateToNotify } }) {
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
		key: mailgunKey.value(),
	})
	const data = {
		from: 'Garbage Service Notification <garbage-service@tweeres.ca>',
		to: email,
		subject,
		text,
		'h:Reply-To': 'tweeres04@gmail.com',
		'o:tag': tags,
	}

	await mg.messages.create(mailgunDomain.value(), data)
}
