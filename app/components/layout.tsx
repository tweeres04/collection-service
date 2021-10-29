export default function Layout({ children }) {
	return (
		<div className="container">
			<div className="navbar">
				<div className="navbar-brand">
					<a href="/" className="navbar-item">
						Oak Bay Collection Service Emails
					</a>
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
