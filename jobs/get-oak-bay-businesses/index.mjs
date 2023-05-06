import scrapeIt from 'scrape-it'
import { readFile, writeFile } from 'node:fs/promises'
import { stringify as csvStringify } from 'csv-stringify/sync'

async function getPage(page = 1) {
	const pageOffset = page * 5
	console.log({ pageOffset })
	let {
		data: { businesses: results },
	} = await scrapeIt(
		`https://visitoakbayvillage.ca/index.php?area_id=1006&page_id=1007&LIMIT8=${pageOffset}`,
		{
			businesses: {
				listItem: '.template_text_default',
				data: {
					name: 'p:nth-of-type(1)',
					info: 'p:nth-of-type(2)',
				},
			},
		}
	)
	results = results.filter((r) => r.name !== '')

	return results
}

async function main() {
	const totalPages = 16
	const pagesArray = [...Array(totalPages).keys()]
	const results = await pagesArray.reduce(async (p, page) => {
		const results = await p

		const pageResults = await getPage(page)

		console.log(
			`Got ${pageResults.length} businesses from page ${page + 1}`
		)

		return [...results, ...pageResults]
	}, Promise.resolve([]))

	await writeFile('output.json', JSON.stringify(results, null, 2), 'utf8')

	console.log('Wrote file')
}

async function getDetails() {
	const fileContent = await readFile('output.json', 'utf8')

	let businesses = JSON.parse(fileContent)

	businesses = businesses.map((b) => {
		function getField(regex) {
			const match = b.info.match(regex)
			return match ? match[1] : null
		}
		const address = getField(/Address: ?(.+)/)
		const phone = getField(/Phone: ?(.+)/)
		const email = getField(/Email: ?(.+)/)
		const website = getField(/Website: ?(.+)/)

		return { name: b.name, address, phone, email, website }
	})

	await writeFile(
		'businesses.csv',
		csvStringify(businesses, { header: true }),
		'utf8'
	)

	console.log('Wrote to business.csv')
}

// main()
getDetails()
