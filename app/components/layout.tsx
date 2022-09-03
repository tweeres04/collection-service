import Link from 'next/link'
import { getAuth, onAuthStateChanged } from '@firebase/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import Head from 'next/head'

export default function Layout({ children }) {
	const [user, setUser] = useState('loading')
	const [burgerExpanded, setBurgerExpanded] = useState(false)
	const router = useRouter()

	useEffect(() => {
		onAuthStateChanged(getAuth(), (user) => {
			setUser(user)
		})
	})

	function toggleBurger() {
		setBurgerExpanded((expanded) => !expanded)
	}

	return (
		<>
			<Head>
				<title>Oak Bay Garbage Service Notifications</title>
				<meta
					name="description"
					content="Make garbage day in Oak Bay effortless. We'll send you an email the day before."
				/>
				<link rel="icon" href="/truck.png" />
			</Head>
			<div className="navbar is-primary">
				<div className="container">
					<div className="navbar-brand">
						<Link href="/">
							<a href="/" className="navbar-item is-size-4">
								Oak Bay Garbage Notifications
							</a>
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
									<Link href="/settings">
										<a
											href="/settings"
											className={clsx('navbar-item', {
												'is-active':
													router.pathname ===
													'/settings',
											})}
										>
											My Settings
										</a>
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
								<Link href="/signin">
									<a
										href="/signin"
										className={clsx('navbar-item', {
											'is-active':
												router.pathname === '/signin',
										})}
									>
										Sign in
									</a>
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
