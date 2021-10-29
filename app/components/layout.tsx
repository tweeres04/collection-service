import Link from 'next/link'
import { getAuth, onAuthStateChanged } from '@firebase/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'

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
		<div className="container">
			<div className="navbar">
				<div className="navbar-brand">
					<Link href="/">
						<a className="navbar-item is-size-4">
							Oak Bay Collection Service Emails
						</a>
					</Link>

					<a
						role="button"
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
					</a>
				</div>
				<div
					className={clsx('navbar-menu', {
						'is-active': burgerExpanded,
					})}
				>
					<div className="navbar-end">
						{user !== 'loading' && user && (
							<Link href="/settings">
								<a
									className={clsx('navbar-item', {
										'is-active':
											router.pathname === '/settings',
									})}
								>
									My Settings
								</a>
							</Link>
						)}
						{user !== 'loading' && !user && (
							<Link href="/signin">
								<a
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
			{children}
			<footer className="footer">
				<div className="content has-text-centered">
					<p>
						By <a href="https://tweeres.ca">Tyler Weeres</a>
					</p>
				</div>
			</footer>
		</div>
	)
}