import QrCode from 'react-qr-code'

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
								<QrCode
									value="https://oakbaygarbagenotifications.tweeres.ca/?utm_source=minimal-qr-code&utm_medium=flyer"
									bgColor="#00000000"
									size={32}
									style={{
										height: 'auto',
										maxWidth: '100%',
										width: '100%',
									}}
									fgColor="rgba(0, 0, 0, 0.7)"
									viewBox={`0 0 32 32`}
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
