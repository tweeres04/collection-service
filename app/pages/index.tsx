import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import { getAnalytics, logEvent } from 'firebase/analytics'

import '../lib/initializeFirebase'

import heroImage from '../assets/hero-light.png'

function Home() {
	return (
		<>
			<Head>
				<title>Oak Bay Garbage Service Notifications</title>
				<meta
					name="description"
					content="Get notified when your garbage day is"
				/>
				<link rel="icon" href="/truck.png" />
			</Head>
			<div className="hero is-halfheight is-primary">
				<div className="hero-body">
					<div className="container">
						<div className="columns is-vcentered">
							<div className="column">
								<h1 className="title">
									Make garbage day in Oak Bay effortless
								</h1>
								<h2 className="subtitle">
									Set up your address, then get emails the day
									before, every time. No more fiddling with
									hard to use schedules.
								</h2>
								<Link href="/signin">
									<a
										className="button is-primary is-large is-inverted"
										onClick={() => {
											logEvent(
												getAnalytics(),
												'click_signin_button'
											)
										}}
									>
										Set it up for free →
									</a>
								</Link>
							</div>
							<div className="column has-text-centered">
								<Image
									src={heroImage}
									alt="A screenshot of an email that tells you your garbage day is tomorrow"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home
