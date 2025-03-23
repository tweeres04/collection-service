import Link from 'next/link'
import Image from 'next/image'

import { getAnalytics, logEvent } from 'firebase/analytics'
import { useUser } from '../lib/useUser'

function Home() {
	const user = useUser()
	return (
		<>
			<div className="hero is-halfheight is-primary">
				<div className="hero-body">
					<div className="container">
						<div className="columns is-vcentered">
							<div className="column">
								<h1 className="title">
									Make the Oak Bay garbage schedule effortless
								</h1>
								<h2 className="subtitle">
									Get email reminders for your Oak Bay garbage
									schedule. Just set up your address and
									email. No more checking paper schedules.
								</h2>
								<p className="mb-5">
									379+ Oak Bay neighbours never miss garbage
									day.
								</p>
								{user ? (
									<Link
										href="/settings"
										className="button is-primary is-large is-inverted"
									>
										My settings
									</Link>
								) : (
									<Link
										href="/signin"
										className="button is-primary is-large is-inverted"
										onClick={() => {
											logEvent(
												getAnalytics(),
												'click_signin_button'
											)
										}}
									>
										Set it up for free →
									</Link>
								)}
							</div>
							<div className="column has-text-centered">
								<Image
									src="/hero.png"
									width={660}
									height={464}
									alt="A screenshot of an email that tells you your garbage day is scheduled for tomorrow"
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
