import { useState, useEffect } from 'react'
import Head from 'next/head'

import '../lib/initializeFirebase'

import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

import 'bulma/css/bulma.min.css'

import streetNames from '../lib/streetNames'

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

	async function saveSettings() {
		const auth = getAuth()
		const db = getFirestore()

		const { uid } = auth.currentUser

		await setDoc(doc(db, 'settings', uid), {
			houseNumber,
			streetName,
		})
		console.log({ houseNumber, streetName }, 'saved')
	}

	return isLoading ? null : (
		<div className="container">
			<div className="navbar">
				<div className="navbar-brand">
					<a href="/" className="navbar-item">
						Oak Bay Collection Service Emails
					</a>
				</div>
			</div>
			<datalist id="streetNamesList">
				{streetNames.map((sn) => (
					<option key={sn}>{sn}</option>
				))}
			</datalist>
			<Head>
				<title>Oak Bay Collection Service Notifications</title>
				<meta
					name="description"
					content="Get notified when your collection day is"
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
										Your address
									</label>
									<div className="control">
										<input
											type="text"
											className="input"
											id="streetNameInput"
											list="streetNamesList"
											value={streetName}
											onChange={(event) => {
												setStreetName(
													event.target.value
												)
											}}
										/>
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
		</div>
	)
}

export default Settings
