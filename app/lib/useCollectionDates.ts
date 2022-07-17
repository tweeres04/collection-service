import { useState, useEffect, useCallback } from 'react'

import { User } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { format } from 'date-fns'
import { getFirestore, doc, getDoc, Timestamp } from 'firebase/firestore'

export type Address = {
	houseNumber: string
	streetName: string
}

function dateToFormattedString(date: Date) {
	date.setDate(date.getDate() + 1) // kick it forward one day to account for UTC on the server
	date.setHours(0)
	return format(date, 'eee MMM d, Y')
}

export function useCollectionDates(user: User | null) {
	const [isLoading, setIsLoading] = useState(true)
	const [collectionDates, setCollectionDates] = useState<string[]>([])

	const getCollectionDates = useCallback(
		async function getCollectionDates() {
			if (user) {
				const db = getFirestore()
				const datesRef = doc(db, 'dates', user.uid)
				const datesSnapshot = await getDoc(datesRef)

				if (datesSnapshot.exists()) {
					const dates = datesSnapshot
						.data()
						?.dates?.map((d: Timestamp) => {
							let date = d.toDate()
							return dateToFormattedString(date)
						})
					setCollectionDates(dates)
				}

				setIsLoading(false)
			}
		},
		[user]
	)

	async function refreshCollectionDates({
		houseNumber,
		streetName,
	}: Address) {
		if (user) {
			setIsLoading(true)

			const functions = getFunctions()
			const refreshCollectionDatesForAddress = httpsCallable<
				Address,
				string[]
			>(functions, 'refreshCollectionDatesForAddress')

			let { data: dates } = await refreshCollectionDatesForAddress({
				houseNumber,
				streetName,
			})

			if (dates) {
				dates = dates.map((dateString) => {
					let date = new Date(dateString)
					return dateToFormattedString(date)
				})
				setCollectionDates(dates)
			}

			setIsLoading(false)
		}
	}

	useEffect(() => {
		getCollectionDates()
	}, [getCollectionDates])

	return {
		collectionDates,
		refreshCollectionDates,
		isLoading,
	}
}
