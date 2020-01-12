const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mailgun = require('mailgun-js');

const { scrapeHTML } = require('scrape-it');
const cheerio = require('cheerio');
const axios = require('axios');
const querystring = require('querystring');
const { parse, isTomorrow, format } = require('date-fns');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
});

exports.getAndStoreCollectionDatesHttps = functions.https.onRequest(
	async (req, res) => {
		const dates = await getNextCollectionDates();
		await storeDates(dates);
		res.sendStatus(204);
	}
);

exports.checkDatesAndSendEmailHttps = functions.https.onRequest(
	async (req, res) => {
		await checkDatesAndSendEmail();
		res.sendStatus(204);
	}
);

exports.checkDatesAndSendEmail = functions.pubsub
	.schedule('every day 08:00')
	.timeZone('America/Vancouver')
	.onRun(async () => {
		await checkDatesAndSendEmail();
	});

exports.getAndStoreCollectionDates = functions.pubsub
	.schedule('0 0 1,15 * *')
	.timeZone('America/Vancouver')
	.onRun(async () => {
		const dates = await getNextCollectionDates();
		await storeDates(dates);
	});

async function checkDatesAndSendEmail() {
	const datesRef = admin.firestore().doc('data/dates');
	const snapshot = await datesRef.get();

	let nextCollectionDates;
	if (!snapshot.exists) {
		throw 'No collection dates in database';
	} else {
		nextCollectionDates = snapshot.data().dates.map((d) => d.toDate());
	}

	console.log('nextCollectionDates', nextCollectionDates);

	const collectionDateToNotify = nextCollectionDates.find(isTomorrow);

	console.log('collectionDateToNotify', collectionDateToNotify);

	if (collectionDateToNotify) {
		const mg = mailgun({
			apiKey: functions.config().mailgun.key,
			domain: functions.config().mailgun.domain,
		});
		const data = {
			from: 'Collection Service Notification <collection-service@tweeres.ca>',
			to: functions.config().mailgun.toemail,
			subject: 'Your pickup day is tomorrow',
			text: `Your next pickup is tomorrow: ${format(
				collectionDateToNotify,
				'eee MMM d, Y'
			)}`,
		};
		await mg.messages().send(data);

		console.log('Sent email');
	}
}

async function getNextCollectionDates() {
	const { data } = await axios.post(
		'https://www.oakbay.ca/municipal-services/garbage-recycling/collection-service-schedule',
		querystring.stringify({
			action: 'lookup',
			street_number: functions.config().address.streetname,
			street_name: functions.config().address.streetnumber,
		})
	);
	const $ = cheerio.load(data);
	const dates = scrapeHTML($, {
		dates: { listItem: '.garbage-next-date' },
	}).dates.map((d) => parse(d, 'EEEE, MMMM, do', new Date()));

	console.log('Found dates', dates);

	return dates;
}

function storeDates(dates) {
	return admin.firestore().doc('data/dates').set({ dates });
}
