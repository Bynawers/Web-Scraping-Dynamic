const puppeteer = require('puppeteer')

const getWine = async (url) => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
  
    await page.goto(url)
    await page.waitForTimeout(200)
  
    
    const result = await page.evaluate(() => {
        let name = document.querySelector('.wine').innerText
        let winery = document.querySelector('.winery').innerText
        let year = document.querySelector('.vintage').innerText
        let image = document.querySelector('.image').getAttribute('src')
      
        return [ name, year, winery, image ]
    })

    const spanTextsRating = await page.$$eval('.rating * span', elements => elements.map(el => el.innerText))

    let image = "https:"+result[3]
    let country = spanTextsRating[0]
    let region = spanTextsRating[1].replace(/·/g, "");
    let winery = spanTextsRating[3].replace(/·/g, "");
    let type = spanTextsRating[5].replace(/·/g, "");
    let name = result[0];
    let year = result[1].replace(new RegExp(name +' ','g'), "");

    browser.close()
    return { name, year, country, region, winery, type, image }
}

const getAllWine = async() => {
    let dataWineApi = [];
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
  
    await page.goto("https://www.vivino.com/explore?e=eJwNyTsOgCAQBcDbbI2F5Sv1ACTWBpfFkMgnCxq5vU47STFRihmGknsxG0M8sFpiLJul-u8Z8DiN0t1FRT28NKZyDPjYuNy571WUJfcPpfsaJQ%3D%3D")
    await page.waitForTimeout(2000)

    const wineUrl = await page.$$eval('#explore-page-app * a', elements => elements.map(el => "https://www.vivino.com" + el.getAttribute("href")))

    
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