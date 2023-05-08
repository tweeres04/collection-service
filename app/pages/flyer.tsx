import QrCode from '../components/qr'

function Home() {
	return (
		<>
			<div className="hero is-fullheight is-primary">
				<div className="hero-body">
					<div className="container">
						<div className="columns has-text-centered is-mobile">
							<div className="column">
								<h1 className="title">
									Get Oak Bay garbage day reminders in your
									email
								</h1>
							</div>
						</div>
						<div className="columns is-mobile">
							<div className="column is-two-thirds is-one-third-desktop mx-auto">
								<QrCode />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home
