import Link from 'next/link'
import { getAuth, onAuthStateChanged } from '@firebase/auth'
import { getAnalytics, isSupported, setUserId } from 'firebase/analytics'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import Head from 'next/head'

import '../lib/initializeFirebase'

const analytics = isSupported().then((supported) =>
	supported ? getAnalytics() : null
)

const title =
	'Get emails for the Oak Bay Garbage Schedule - Oak Bay Garbage Schedule Notifications'
const description =
	'Forget about checking the Oak Bay garbage schedule. Our free service emails you the day before pickup day. No more missed collections or paper schedules!'

export default function Layout({ children }) {
	const [user, setUser] = useState('loading')
	const [burgerExpanded, setBurgerExpanded] = useState(false)
	const router = useRouter()

	useEffect(() => {
		onAuthStateChanged(getAuth(), (user) => {
			setUser(user)
			if (user) {
				analytics.then((analytics) => {
					if (analytics) {
						setUserId(analytics, user?.uid)
					}
				})
			}
		})
	}, [])

	function toggleBurger() {
		setBurgerExpanded((expanded) => !expanded)
	}

	return (
		<>
			<Head>
				<title>{title}</title>
				<meta name="description" content={description} />
				<link rel="icon" href="/truck.png" />
				<meta property="og:title" content={title} />
				<meta
					property="og:url"
					content="https://oakbaygarbagenotifications.tweeres.ca"
				/>
				<meta property="og:description" content={description} />
				<meta
					property="og:image"
					content="https://oakbaygarbagenotifications.tweeres.ca/hero.png"
				/>
			</Head>
			<div className="navbar is-primary">
				<div className="container">
					<div className="navbar-brand">
						<Link href="/" className="navbar-item is-size-4">
							Oak Bay Garbage Notifications
						</Link>
						<button
							className={clsx('navbar-burger', {
								'is-active': burgerExpanded,
							})}
							aria-label="menu"
							aria-expanded="false"
							onClick={toggleBurger}
						>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
						</button>
					</div>
					<div
						className={clsx('navbar-menu', {
							'is-active': burgerExpanded,
						})}
					>
						<div className="navbar-end">
							{user !== 'loading' && user && (
								<>
									<Link
										href="/settings"
										className={clsx('navbar-item', {
											'is-active':
												router.pathname === '/settings',
										})}
									>
										My Settings
									</Link>
									<a
										href="/"
										className="navbar-item"
										onClick={(e) => {
											e.preventDefault()
											getAuth().signOut()
											router.push('/')
										}}
									>
										Sign out
									</a>
								</>
							)}
							{user !== 'loading' && !user && (
								<Link
									href="/signin"
									className={clsx('navbar-item', {
										'is-active':
											router.pathname === '/signin',
									})}
								>
									Sign in
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
			{children}
			<footer className="footer">
				<div className="content has-text-centered">
					<p>
						By <a href="https://tweeres.ca">Tyler Weeres</a>
					</p>
				</div>
			</footer>
		</>
	)
}
