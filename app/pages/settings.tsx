import { useState, useEffect } from 'react'
import Head from 'next/head'

import '../lib/initializeFirebase'

import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import {
	getFirestore,
	doc,
	setDoc,
	getDoc,
	Timestamp,
} from 'firebase/firestore'
import { format } from 'date-fns'

import streetNames from '../lib/streetNames'
import { getAnalytics, logEvent } from '@firebase/analytics'

function useUser() {
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		const auth = getAuth()
		onAuthStateChanged(auth, (user) => {
			setUser(user)
		})
	}, [])

	return user
}

function useSettings(user: User | null) {
	const [isLoading, setIsLoading] = useState(true)
	const [houseNumber, setHouseNumber] = useState('')
	const [streetName, setStreetName] = useState('')

	useEffect(() => {
		async function getSettings() {
			if (user) {
				const db = getFirestore()
				const settingsRef = doc(db, 'settings', user.uid)
				const settingsSnapshot = await getDoc(settingsRef)

				if (settingsSnapshot.exists()) {
					const settings = settingsSnapshot.data()
					setHouseNumber(settings.houseNumber)
					setStreetName(settings.streetName)
				}
				setIsLoading(false)
			}
		}
		getSettings()
	}, [user])

	function saveSettings() {
		const auth = getAuth()
		const db = getFirestore()
		const analytics = getAnalytics()

		const { uid } = auth.currentUser as User

		setDoc(doc(db, 'settings', uid), {
			houseNumber,
			streetName,
		})
		logEvent(analytics, 'save_settings')
	}

	return {
		isLoading,
		houseNumber,
		setHouseNumber,
		streetName,
		setStreetName,
		saveSettings,
	}
}

function useCollectionDates(user: User | null) {
	const [isLoading, setIsLoading] = useState(true)
	const [collectionDates, setCollectionDates] = useState<string[] | null>(
		null
	)

	useEffect(() => {
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
							date.setDate(date.getDate() + 1) // kick it forward one day to account for UTC on the server
							date.setHours(0)
							return format(date, 'eee MMM d, Y')
						})
					setCollectionDates(dates)
				}

				setIsLoading(false)
			}
		}
		getCollectionDates()
	}, [user])

	return { collectionDates, isLoading }
}

function Settings() {
	const user = useUser()
	const {
		isLoading: isLoadingSettings,
		houseNumber,
		setHouseNumber,
		streetName,
		setStreetName,
		saveSettings,
	} = useSettings(user)
	const { isLoading: isLoadingCollectionDates, collectionDates } =
		useCollectionDates(user)

	return isLoadingSettings ? null : (
		<>
			<Head>
				<meta name="robots" content="noindex" />
			</Head>
			<datalist id="streetNamesList">
				{streetNames.map((sn) => (
					<option key={sn}>{sn}</option>
				))}
			</datalist>
			<div className="hero is-medium">
				<div className="hero-body">
					<div className="container">
						<div className="columns">
							<div className="column">
								<h1 className="title">Settings</h1>
								<div className="field">
									<label
										htmlFor="emailInput"
										className="label"
									>
										Email
									</label>
									<div className="control">
										<input
											type="text"
											className="input"
											id="emailInput"
											disabled
											value={user?.email || ''}
										/>
									</div>
								</div>
								<div className="field">
									<label
										htmlFor="houseNumberInput"
										className="label"
									>
										House number
									</label>
									<div className="control">
										<input
											type="text"
											className="input"
											id="houseNumberInput"
											value={houseNumber}
											onChange={(event) => {
												setHouseNumber(
													event.target.value
												)
											}}
										/>
									</div>
								</div>
								<div className="field">
									<label
										htmlFor="streetNameInput"
										className="label"
									>
										Street name
									</label>
									<div className="control">
										<div className="select">
											<select
												id="streetNameInput"
												value={streetName}
												onChange={(event) => {
													setStreetName(
														event.target.value
													)
												}}
											>
												{streetNames.map((sn) => (
													<option key={sn}>
														{sn}
													</option>
												))}
											</select>
										</div>
									</div>
								</div>
								<div className="field">
									<div className="control">
										<button
											className="button is-primary is-large"
											onClick={saveSettings}
											disabled={
												!houseNumber || !streetName
											}
										>
											Save
										</button>
									</div>
								</div>
							</div>
							{!isLoadingCollectionDates && (
								<div className="column content">
									<h1>Next garbage days:</h1>
									{collectionDates ? (
										<ul>
											{collectionDates.map((cd) => (
												<li className="is-size-4">
													{cd}
												</li>
											))}
										</ul>
									) : (
										<p>
											No dates fetched for this account
											yet. Garbage dates are fetched on
											the 1st and 15th of every month.
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Settings
