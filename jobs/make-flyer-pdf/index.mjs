import puppeteer from 'puppeteer'
import { writeFile } from 'node:fs/promises'

const browser = await puppeteer.launch()
const page = (await browser.pages())[0]

await page.goto('http://localhost:3000/flyer', {
	waitUntil: 'networkidle0',
})

await page.setViewport({ width: 435, height: 730 })

const pdfResult = await page.pdf({
	width: 435,
	height: 730,
	omitBackground: false,
	printBackground: true,
})

await writeFile('flyer.pdf', pdfResult)

await browser.close()
