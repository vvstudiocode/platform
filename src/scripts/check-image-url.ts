import fetch from 'node-fetch'

const originalUrl = 'https://shoplineimg.com/690007e1a0df1400685f68e2/698301a8dbb947fe11fea1a2/720x.webp?source_format=JPG'
const baseUrl = originalUrl.split('?')[0]

const jpgUrl = baseUrl.replace('.webp', '.jpg')
const pngUrl = baseUrl.replace('.webp', '.png')
const originalNoQuery = baseUrl

async function checkUrl(url: string) {
    try {
        const res = await fetch(url, { method: 'HEAD' })
        console.log(`Checking ${url}: status ${res.status} content-type ${res.headers.get('content-type')}`)
    } catch (e) {
        console.error(`Error checking ${url}:`, e)
    }
}

async function run() {
    await checkUrl(originalUrl)
    await checkUrl(jpgUrl)
    await checkUrl(pngUrl)
    await checkUrl(originalNoQuery)
}

run()
