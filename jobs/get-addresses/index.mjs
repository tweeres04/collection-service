import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import _ from 'lodash'

initializeApp({
	credential: applicationDefault(),
	databaseURL: 'https://collection-service.firebaseio.com',
})

const db = getFirestore()

async function addresses() {
	const snapshot = await db.collection('settings').get()
	const addresses = snapshot.docs.reduce((result, doc) => {
		let settings = doc.data()

		if (settings.enabled && settings.houseNumber && settings.streetName) {
			return [...result, `${settings.houseNumber} ${settings.streetName}`]
		} else {
			return result
		}
	}, [])

	const uniqueAddresses = _.uniq(addresses)
	addresses.forEach((a) => console.log(`${a} Oak Bay BC Canada`))
	console.log(
		`${addresses.length - uniqueAddresses.length} duplicate addresses`
	)
}

addresses()
