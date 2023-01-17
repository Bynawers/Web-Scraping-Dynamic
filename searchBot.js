const puppeteer = require('puppeteer')
const { converBase64ToImage } = require('convert-base64-to-image')
const fs = require('fs');
    request = require('request');


const getWine = async (name) => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()


    await page.goto("https://www.google.com/search?q="+name+"&source=lnms&tbm=isch")
    page.waitForNavigation()

    const [cookies] = await page.$x("//button[contains(., 'Reject all')]");
    if (!cookies) throw new Error("button not found");
    await cookies.click();

    await page.waitForTimeout(1000)


    let imageBase64 = await page.$$eval('#islrg * img', elements => elements.map(el => el.getAttribute("src")))
    let linkPng = await page.$$eval('#islrg * .islib * a', elements => elements.map(el => el.getAttribute("href")))

    console.log();

    /*
    imageBase64.filter(image => image != null && !image.includes("encrypted")).map( (element, index) => {
        downloadImage(element, name+"_"+index);
        if (index > 10) { return; }
    })*/

    await page.waitForTimeout(1000)
    browser.close();
}

const downloadImage = (base64, name) => {
    const path = converBase64ToImage(base64, "./tmp/"+name+".png");
}

https://www.google.com/search?q=La+T%C3%A2che+Grand+Cru&source=lnms&tbm=isch
getWine("La Tâche Grand Cru")
