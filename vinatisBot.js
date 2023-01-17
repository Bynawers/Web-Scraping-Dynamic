const puppeteer = require('puppeteer')
const axios = require('axios');
const fs = require('fs');

const DELAY_LOAD = 3000;
const DELAY_TIME = 2000;

const download_image = (url, image_path) =>
    axios({
        url,
        responseType: 'stream',
    })
    .then(
        response => new Promise((resolve, reject) => {
            response.data
            .pipe(fs.createWriteStream(image_path))
            .on('finish', () => resolve())
            .on('error', e => reject(e));
    }),
);

function containsNumbers(str) {
    return /\d/.test(str);
}

const getWine = async (url) => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
  
    await page.goto(url)
    await page.waitForTimeout(DELAY_TIME)

    let description = await page.$$eval('.padding-bottom-20 * .padding-horizontal-10 * .text-bold', el => el.map(el => el.textContent))

    let millesime = description[0];
    let grape = description[1];
    let taste = description[2];
    let tasteType = description[3];
    let temperature = description[7];

    let name = await page.$$eval('#produit-titre * span', el => el.map(el => el.textContent))

    let imageUrl = await page.$$eval('#image-block * img', el => el.map(el => el.getAttribute("src")))
    console.log(imageUrl)
    download_image(imageUrl, "./tmp/"+name+".png")

    browser.close()
    return { millesime: millesime, grape: grape, taste: taste, tasteType: tasteType, temperature: temperature }
}

const getAllWine = async() => {
    let dataWineApi = []
    let wineUrl = []
    let isAlreadyUseUrl = []

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
  
    await page.goto("https://www.vinatis.com/achat-vin-rouge")
    await page.waitForTimeout(DELAY_LOAD)

    const allUrl = await page.$$eval('#vue-product-list * .vue-product-top * a', elements => elements.map(el => el.getAttribute("href")))
    allUrl.filter(url => containsNumbers(url)).map(url => {
        let idWine = url.substring(1,6)
        if (!isAlreadyUseUrl.includes(idWine)) {
            isAlreadyUseUrl.push(idWine)
            wineUrl.push("https://www.vinatis.com" + url)
        }
    })
    
    for (const url of wineUrl) {
        try {
            let dataTemp = await getWine(url); 
            dataWineApi.push(dataTemp);
            console.log(url);
        } catch (e) { }
    }
    
    console.log(dataWineApi)
    browser.close()
}

getAllWine();