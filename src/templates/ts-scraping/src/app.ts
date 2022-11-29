import cheerio from 'cheerio'
import 'dotenv/config'
import fs from 'fs/promises'
import { gotScraping as got } from 'got-scraping'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: process.env.API_KEY_2CAPTCHA as string,
    },
    visualFeedback: true,
  })
)

const browser = await puppeteer.launch({ headless: false })
const page = await browser.newPage()
await page.goto('https://www.example.com')
await page.waitForSelector('input')
const { captchas, filtered, error } = await page.findRecaptchas()
if (captchas.length > 0) {
  console.log('captcha found')
  // await page.solveRecaptchas()
  console.log('captcha solved')
} else {
  console.log('no captcha')
}

// if JS not required

const domain = 'https://example.com'
const html = await got.get(domain, { resolveBodyOnly: true })
const $ = cheerio.load(html)
await fs.writeFile(`${domain}_dump.html`, html)
