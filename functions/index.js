const admin = require('firebase-admin')

const getAndStoreCollectionDates = require('./getAndStoreCollectionDates')
const checkDatesAndSendEmail = require('./checkDatesAndSendEmail')

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
})

exports.getAndStoreCollectionDatesHttps =
	getAndStoreCollectionDates.getAndStoreCollectionDatesHttps
exports.refreshCollectionDatesForAddress =
	getAndStoreCollectionDates.refreshCollectionDatesForAddress
exports.getAndStoreCollectionDates =
	getAndStoreCollectionDates.getAndStoreCollectionDates

exports.checkDatesAndSendEmailHttps =
	checkDatesAndSendEmail.checkDatesAndSendEmailHttps

exports.checkDatesAndSendEmail = checkDatesAndSendEmail.checkDatesAndSendEmail
