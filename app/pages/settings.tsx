import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

import '../lib/initializeFirebase'

import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
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

function useSettings(getCollectionDates, user: User | null) {
	const [isLoading, setIsLoading] = useState(true)
	const [houseNumber, setHouseNumber] = useState('')
	const [streetName, setStreetName] = useState('')
	const [enabled, setEnabled] = useState(true)

	useEffect(() => {
		async function getSettings() {
			if (user) {
				const db = getFirestore()
				const settingsRef = doc(db, 'settings', user.uid)
				const settingsSnapshot = await getDoc(settingsRef)

				if (settingsSnapshot.exists()) {
					const settings = settingsSnapshot.data()
					setHouseNumber(settings.houseNumber || '')
					setStreetName(settings.streetName || '')
					setEnabled(
						settings.enabled === undefined ? true : settings.enabled
					)
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
			enabled,
		}).then(getCollectionDates)
		logEvent(analytics, 'save_settings')
	}

	return {
		isLoading,
		houseNumber,
		setHouseNumber,
		streetName,
		setStreetName,
		enabled,
		setEnabled,
		saveSettings,
	}
}

function useCollectionDates(user: User | null) {
	const [isLoading, setIsLoading] = useState(true)
	const [collectionDates, setCollectionDates] = useState<string[] | null>(
		null
	)

	const getCollectionDates = useCallback(
		async function getCollectionDates() {
			if (user) {
				setIsLoading(true)

				const functions = getFunctions()
				const getAndStoreCollectionDates = httpsCallable(
					functions,
					'getAndStoreCollectionDatesCallable'
				)

				let { data: dates } = await getAndStoreCollectionDates()

				if (dates) {
					dates = dates.map((dateString) => {
						let date = new Date(dateString)
						date.setDate(date.getDate() + 1) // kick it forward one day to account for UTC on the server
						date.setHours(0)
						return format(date, 'eee MMM d, Y')
					})
					setCollectionDates(dates)
				}

				setIsLoading(false)
			}
		},
		[user]
	)

	useEffect(() => {
		getCollectionDates()
	}, [getCollectionDates])

	return { collectionDates, getCollectionDates, isLoading }
}

function Settings() {
	const user = useUser()
	const {
		isLoading: isLoadingCollectionDates,
		getCollectionDates,
		collectionDates,
	} = useCollectionDates(user)
	const {
		isLoading: isLoadingSettings,
		houseNumber,
		setHouseNumber,
		streetName,
		setStreetName,
		enabled,
		setEnabled,
		saveSettings,
	} = useSettings(getCollectionDates, user)

	return isLoadingSettings ? null : (
		<>
			<Head>
				<title>Settings - Oak Bay Garbage Service Notifications</title>
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
										<label
											htmlFor="enabledCheckbox"
											className="checkbox"
										>
											<input
												type="checkbox"
												name="enabled"
												id="enabledCheckbox"
												checked={enabled}
												onChange={(e) => {
													setEnabled(e.target.checked)
												}}
											/>{' '}
											Emails enabled
										</label>
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
							<div className="column content">
								{isLoadingCollectionDates ? (
									<p>Fetching your next garbage days...</p>
								) : (
									<>
										<h1>Your next garbage days:</h1>
										{collectionDates.length > 0 ? (
											<ul>
												{collectionDates.map((cd) => (
													<li
														className="is-size-4"
														key={cd}
													>
														{cd}
													</li>
												))}
											</ul>
										) : enabled ? (
											<p>
												No dates found. Please double
												check the address you entered
												and try again.
											</p>
										) : (
											<p>
												You've disabled your
												notifications.
											</p>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Settings
