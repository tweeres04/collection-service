import type { AppProps } from 'next/app'

import '../styles/styles.scss'

import Layout from '../components/layout'

function MyApp({ Component, pageProps, router }: AppProps) {
	return router.pathname.startsWith('/flyer') ? (
		<Component />
	) : (
		<Layout>
			<Component {...pageProps} />
		</Layout>
	)
}
export default MyApp
