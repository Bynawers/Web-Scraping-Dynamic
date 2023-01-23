var colors = require('colors');

const Vinatis = require("./src/script/vinatisBot");
const Milesima = require("./src/script/milesimaBot")

const help = () => {
    console.log("")
    console.log(colors.magenta("node")+" index.js "+ colors.green("[website] [action] --[info]"));
    console.log(colors.green("[website]")+" : 'vinatis' 'milesima' ")
    console.log(colors.green("[action]")+" : 'url' 'wine' 'auto' ")
    console.log(colors.green("[info]")+" : 'rouge' 'blanc' 'rose' 'champagne' 'grand-vin' 'effervescent' 'spiritueux' ")
    console.log("")
}

function getType (type) {
    const wine = {
        "rouge": 0,
        "blanc" : 1,
        "rose": 2,
        "champagne": 3,
        "effervescent": 4,
        "grand-vin": 5,
        "spiritueux": 6,
        "default": 0
    }
    return wine[type]
  }

if (process.argv.length < 3 || process.argv.length > 5) {
    help();
    return;
}

if (process.argv[2] === "vinatis") {
    process.argv[3] === "wine" ? Vinatis.start(getType(process.argv[4])) : process.argv[3] === "url" ? Vinatis.url(getType(process.argv[4])) : help();
} 
else if (process.argv[2] === "milesima") {
    process.argv[3] === "wine" ? Milesima.start() : process.argv[3] === "url" ? Milesima.url() : help();
}
else {
    help();
}