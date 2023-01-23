const puppeteer = require('puppeteer')
const axios = require('axios');
const fs = require('fs');

const typeWine = require("../data/type/typeWineMilesima.json");

const DELAY_LOAD = 3000;
const DELAY_TIME = 2000;

const BASE_URL = "https://www.millesima.be/tous-nos-vins.html"

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

module.exports = {
    start : function start(type) {
        console.log("Start Milesima bot")
    },
    url : function url(type) {
        console.log("Start Url Milesima")
    }
}   
