import { useState, useEffect } from 'react'
import Head from 'next/head'

import { getAuth, User } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

import streetNames from '../lib/streetNames'
import {
	useCollectionDates,
	Settings as SettingsType,
} from '../lib/useCollectionDates'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { getFunctions, httpsCallable } from 'firebase/functions'

import { useUser } from '../lib/useUser'

function useSettings(
	refreshCollectionDates: (address: SettingsType) => Promise<unknown>,
	user: User | null
) {
	const [isLoading, setIsLoading] = useState(true)
	const [houseNumber, setHouseNumber] = useState('')
	const [streetName, setStreetName] = useState('')
	const [enabled, setEnabled] = useState(true)
	const [savedSettings, setSavedSettings] = useState(null)

	useEffect(() => {
		async function getSettings() {
			if (user) {
				const db = getFirestore()
				const settingsRef = doc(db, 'settings', user.uid)
				const settingsSnapshot = await getDoc(settingsRef)

				if (settingsSnapshot.exists()) {
					const settings = settingsSnapshot.data()
					setSavedSettings(settings)
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
		}).then(() =>
			refreshCollectionDates({ enabled, houseNumber, streetName })
		)
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
		savedSettings,
	}
}

function useSendTestEmail() {
	const [testEmailSent, setTestEmailSent] = useState(false)
	const functions = getFunctions()
	const sendTestEmail = httpsCallable(functions, 'sendTestEmail')

	return { sendTestEmail, testEmailSent, setTestEmailSent }
}

function Settings() {
	const user = useUser()
	const {
		isLoading: isLoadingCollectionDates,
		collectionDates,
		refreshCollectionDates,
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
		savedSettings,
	} = useSettings(refreshCollectionDates, user)
	const { sendTestEmail, testEmailSent, setTestEmailSent } =
		useSendTestEmail()

	const fieldsFilledIn = houseNumber && streetName

	return isLoadingSettings ? null : (
		<>
			<Head>
				<title>Settings - Oak Bay Garbage Service Notifications</title>
				<meta name="robots" content="noindex" />
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
												{['', ...streetNames].map(
													(sn) => (
														<option key={sn}>
															{sn}
														</option>
													)
												)}
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
											disabled={!fieldsFilledIn}
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
											<>
												<ul>
													{collectionDates.map(
														(cd) => (
															<li
																className="is-size-4"
																key={cd}
															>
																{cd}
															</li>
														)
													)}
												</ul>
												<p>
													You're all set! Add
													<code>
														garbage-service@tweeres.ca
													</code>
													to your safe senders list so
													the emails don't go to your
													junk mail.
												</p>
												{testEmailSent ? (
													<div className="notification is-primary is-light">
														<p>
															Test email sent!
															Check your inbox and
															spam/junk folders.
														</p>
														<p>
															If it's in spam or
															junk, be sure to
															mark it as "not
															spam" or "not junk"
															so you see the real
															alerts!
														</p>
													</div>
												) : (
													<p>
														Test it out by clicking
														the button below:
													</p>
												)}
												<p>
													<button
														className="button"
														onClick={async () => {
															await sendTestEmail(
																{
																	collectionDateToNotify:
																		collectionDates[0],
																	email: user?.email,
																}
															)
															setTestEmailSent(
																true
															)
														}}
													>
														Send Test Email
													</button>
												</p>
												<p>
													Garbage dates out of date?
													Refresh them with this
													button:
												</p>
												<button
													className="button"
													onClick={saveSettings}
												>
													Refresh dates
												</button>
											</>
										) : enabled ? (
											!savedSettings ? (
												<p>
													Enter your address to get
													your next garbage dates and
													set up your email
													notifications.
												</p>
											) : (
												<p>
													No dates found. Please
													double check the address you
													entered and try again.
												</p>
											)
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
