import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import 'bulma/css/bulma.min.css'

const Home: NextPage = () => {
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
			<div className="hero is-fullheight">
				<div className="hero-body">
					<div className="container">
						<div className="columns">
							<div className="column">
								<h1 className="title">
									Oak Bay Collection Emails
								</h1>
								<h2 className="subtitle">
									Get an email the day before your collection
									day.
								</h2>
							</div>
							<div className="column has-text-centered">
								<Link href="/signup">
									<a className="button is-primary is-large">
										Get started for free
									</a>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
