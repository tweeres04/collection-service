import Link from 'next/link'
import Image from 'next/image'

import { getAnalytics, logEvent } from 'firebase/analytics'

function Home() {
	return (
		<>
			<div className="hero is-halfheight is-primary">
				<div className="hero-body">
					<div className="container">
						<div className="columns is-vcentered">
							<div className="column">
								<h1 className="title">
									Make garbage day in Oak Bay effortless
								</h1>
								<h2 className="subtitle">
									Set up your address and email, then get
									emails the day before, every time. No more
									fiddling with hard to use schedules.
								</h2>
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
							</div>
							<div className="column has-text-centered">
								<Image
									src="/hero.png"
									width={660}
									height={464}
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
