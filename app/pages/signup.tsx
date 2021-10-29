import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} from 'firebase/auth'
import { getAnalytics, logEvent } from '@firebase/analytics'

import '../lib/initializeFirebase'

import 'bulma/css/bulma.min.css'

const Home: NextPage = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const router = useRouter()

	function redirectToSettings() {
		router.push('/settings')
	}

	async function signInOrCreateAccount() {
		const auth = getAuth()
		const analytics = getAnalytics()

		try {
			await signInWithEmailAndPassword(auth, email, password)

			logEvent(analytics, 'sign_in')

			redirectToSettings()
		} catch (err) {
			console.error({ code: err.code, message: err.message })
			if (err.code === 'auth/user-not-found') {
				try {
					await createUserWithEmailAndPassword(auth, email, password)

					logEvent(analytics, 'create_account')

					redirectToSettings()
				} catch (err) {
					console.error(err)
				}
			}
		}
	}

	return (
		<div className="container">
			<div className="navbar">
				<div className="navbar-brand">
					<a href="/" className="navbar-item">
						Oak Bay Collection Service Emails
					</a>
				</div>
			</div>
			<Head>
				<title>Oak Bay Collection Service Notifications</title>
				<meta
					name="description"
					content="Get notified when your collection day is"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="hero is-large">
				<div className="hero-body">
					<div className="container">
						<div className="columns">
							<div className="column">
								<h1 className="title">
									Sign in or create an account
								</h1>
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
											value={email}
											onChange={(event) => {
												setEmail(event.target.value)
											}}
										/>
									</div>
								</div>
								<div className="field">
									<label
										htmlFor="passwordInput"
										className="label"
									>
										Password
									</label>
									<div className="control">
										<input
											className="input"
											id="password"
											type="password"
											value={password}
											onChange={(event) => {
												setPassword(event.target.value)
											}}
										/>
									</div>
								</div>
								<div className="field">
									<div className="control">
										<button
											className="button is-primary"
											onClick={signInOrCreateAccount}
										>
											Sign up/Sign in
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

export default Home
