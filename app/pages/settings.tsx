import { useState, useEffect } from 'react'
import Head from 'next/head'

import '../lib/initializeFirebase'

import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

import streetNames from '../lib/streetNames'
import { getAnalytics, logEvent } from '@firebase/analytics'

function Settings() {
	const [user, setUser] = useState()
	const [isLoading, setIsLoading] = useState(true)
	const [houseNumber, setHouseNumber] = useState('')
	const [streetName, setStreetName] = useState('')

	useEffect(() => {
		const auth = getAuth()
		onAuthStateChanged(auth, (user) => {
			console.log({ user })
			setUser(user)
		})
	}, [])

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

		const { uid } = auth.currentUser

		setDoc(doc(db, 'settings', uid), {
			houseNumber,
			streetName,
		})
		logEvent(analytics, 'save_settings')
		console.log({ houseNumber, streetName }, 'saved')
	}

	return isLoading ? null : (
		<>
			<datalist id="streetNamesList">
				{streetNames.map((sn) => (
					<option key={sn}>{sn}</option>
				))}
			</datalist>
			<Head>
				<title>Oak Bay Garbage Service Notifications</title>
				<meta
					name="description"
					content="Get notified when your garbage day is"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
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
											value={user.email}
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
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Settings
