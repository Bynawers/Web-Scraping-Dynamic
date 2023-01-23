const puppeteer = require('puppeteer')
const axios = require('axios');
const fs = require('fs');

const typeWineVinatis = require("../data/type/typeWineVinatis.json");

const DELAY_LOAD = 3000;
const DELAY_TIME = 2000;

const BASE_URL = "https://www.vinatis.com/"

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

    let type = null
    let millesime = null
    let grape = null
    let temperature_service = null
    let volume = null
    let alcool = null
    let characteritics = []

    let description = await page.$$eval('.padding-bottom-20 * .padding-horizontal-10 * .color-gray-darker', description => description.map(el => el.textContent));
    description.map((el, index) =>  {
        if (el.toLowerCase().includes("millésime")) {
            millesime = parseInt(description[index+1]);
        } else if (el.toLowerCase().includes("cépage")) {
            grape = description[index+1].split(",")[0].replace(/[0-9]*%/g, "").replace(/ /g, "");
        } else if (el.toLowerCase().includes("par goûts")) {
            characteritics.push(description[index+1])
        } else if (el.toLowerCase().includes("température")) {
            let descTemp = description[index+1].split("-")
            temperature_service = {
                min: parseInt(descTemp[0]),
                max: parseInt(descTemp[1].replace(/°C/g, ""))
            }
        }
    })

    let regexId = /(\d+)/;
    let name = url.replace(/https:\/\/www.vinatis.com\/[0-9]*-/i, " ").replace(/-/g, " ")
    let match = url.match(regexId);
    let id = parseInt(match[0]);

    let subDescription = await page.$$eval('.col-xs-12 * .product-subtitle-v2 ', el => el.map(el => el.textContent))
    subDescription = subDescription[0].split("/")
    subDescription.map(el => {
        if (el.includes("L")) {
            volume = parseFloat(el.split("L")[0].replace(/,/g, ".")) * 1000
        } else if (el.includes("%")) {
            alcool = el.replace(/vol/g, "").replace(/ /g, "")
        }
    })
    type = subDescription[0].toLocaleLowerCase().split("l")[1].replace(/vin/g, "").replace(/ /g, "")

    let imageUrl = await page.$$eval('#image-block * img', el => el.map(el => el.getAttribute("src")))
    //download_image(imageUrl, "../../tmp/image/"+name+".png")
    const wine = { 
        name: name, 
        type: type,
        country: null,
        winery: null,
        region: null,
        idVinatis: id, 
        millesime: millesime, 
        natural: null,
        grape: grape, 
        temperature_service: temperature_service, 
        imageUrl: imageUrl[0], 
        volume: volume, 
        alcool: alcool,
        characteritics: characteritics
    }
    console.log(wine)
    browser.close()
    return wine
}

const getAllWine = async(urlType) => {
    let dataWineApi = []

    let wineUrl = require('../data/url/'+urlType+'.json');

    for (const url of wineUrl) {
        try {
            console.log(url);
            let dataTemp = await getWine(url); 
            dataWineApi.push(dataTemp);
            console.log(dataWineApi);
        } catch (e) { console.log(e) }
    }
    let data = JSON.stringify(dataWineApi, null, 4);
    fs.writeFileSync('./src/data/output/'+urlType+'.json', data);
    browser.close()
}

const getAllWineUrl = async (urlType, pageMax) => {
    let pageNumber = 1;
    let wineUrl = require('../data/url/'+urlType+'.json');
    let isAlreadyUseUrl = []

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    await page.goto(BASE_URL + urlType, { waitUntil: 'domcontentloaded' })

    while (pageNumber < pageMax+1) {
        try {
            await page.waitForTimeout(DELAY_LOAD)

            const allUrl = await page.$$eval('#vue-product-list * .vue-product-top * a', elements => elements.map(el => el.getAttribute("href")))
            allUrl.filter(url => containsNumbers(url)).map(url => {
                let idWine = url.substring(1,6)
                if (!isAlreadyUseUrl.includes(idWine)) {
                    isAlreadyUseUrl.push(idWine)
                    wineUrl.push("https://www.vinatis.com" + url)
                }
            })
            let data = JSON.stringify(wineUrl, null, 4);
            fs.writeFileSync('./src/data/url/'+urlType+'.json', data);
        } 
        catch (e) { 
            console.log("ERROR: " + e) 
        }

        pageNumber = pageNumber + 1;
        await page.goto(BASE_URL + urlType+"?page="+pageNumber+"&tri=7", { waitUntil: 'domcontentloaded' })
    }
    await page.waitForTimeout(DELAY_LOAD)
    browser.close()
}

module.exports = {
    start : function start(type) {
        console.log("Start Vinatis bot")
        getAllWine()
    },
    url : function url(type) {
        console.log("Start Url Vinatis bot "+type)
        getAllWineUrl(typeWineVinatis[type].name, typeWineVinatis[type].page)
        //getWine("https://www.vinatis.com/28849-rhum-millonario-xo")
    }
}   
