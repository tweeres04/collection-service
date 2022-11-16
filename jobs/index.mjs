import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp({
	credential: applicationDefault(),
	databaseURL: 'https://collection-service.firebaseio.com',
})

const db = getFirestore()

async function settings() {
	const snapshot = await db.collection('settings').get()
	const total = snapshot.docs.reduce((sum, doc) => {
		let settings = doc.data()

		if (settings.enabled) {
			return sum + 1
		} else {
			return sum
		}
	}, 0)
	console.log(`${total} accounts enabled`)
}

async function dates() {
	const snapshot = await db
		.collection('dates')
		.orderBy('dates')
		.get()
		.catch((err) => {
			console.error(err)
		})
	snapshot.forEach((doc) => {
		let { dates } = doc.data()
		dates = dates.map((d) => d.toDate())
		console.log(doc.id, dates)
	})
}

// dates()
settings()
