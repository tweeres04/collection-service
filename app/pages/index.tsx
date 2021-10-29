import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import { getAnalytics, logEvent } from 'firebase/analytics'

import '../lib/initializeFirebase'

import 'bulma/css/bulma.min.css'

import heroImage from '../assets/hero.png'

function Home() {
	return (
		<>
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
				<div className="hero is-halfheight">
					<div className="hero-body">
						<div className="container">
							<div className="columns is-vcentered">
								<div className="column">
									<h1 className="title">
										Stop worrying about collection day
									</h1>
									<h2 className="subtitle">
										Get an email the day before. No Hassle!
									</h2>
									<Link href="/signup">
										<a
											className="button is-primary is-large"
											onClick={() => {
												logEvent(
													getAnalytics(),
													'click_signup_button'
												)
											}}
										>
											Set it up for free
										</a>
									</Link>
								</div>
								<div className="column has-text-centered">
									<Image src={heroImage} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
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

export default Home
