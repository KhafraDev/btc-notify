const { get, request } = require('https');
require('./env')();

const priceCache = [];

/**
 * Ping CoinGecko's API to make sure it's available. :)
 */
const getPing = () => new Promise(resolve =>
    get('https://api.coingecko.com/api/v3/ping', {
        headers: {
            'Accept': 'application/json'
        }
    }, res => res.on('data', d => {
        try {
            JSON.parse(d);
            return resolve(res.statusCode === 200);
        } catch {
            return reject(d);
        }
    })).end()
);

/**
 * Get the current BTC price
 */
const getBTCPrice = () => new Promise(resolve =>
    get('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&community_data=false', {
        headers: {
            'Accept': 'application/json'
        }
    }, res => {
        const buff = [];
        res.on('data', d => buff.push(d)); // data comes in chunks; not complete
        res.on('end', () => resolve(JSON.parse(buff.join(''))['market_data']['current_price']['usd']));
    }).end()
);

/**
 * Send a webhook to Discord
 * @param {number} totalDiff total % difference from start
 * @param {number} diff % difference of price since last check 
 */
const sendWebhook = async (totalDiff, diff) => {
    const body = {
        embeds: [{
            'title': 'Update',
            'description': `Difference since last check: ${diff}%\nTotal difference since starting: ${totalDiff}%`,
            'color': 2550200,
            'timestamp': new Date(),
            'author': {
                'name': 'BTC Notify',
                'icon_url': 'https://cdn.discordapp.com/avatars/267774648622645249/e03217cd10c97eebd7cb7b2f2a943cb1.png'
            }
        }]
    };

    if(totalDiff > 10 || totalDiff < -10) {
        body.content = '<@!267774648622645249>';
    }

    return new Promise(resolve => {
        const req = request(process.env.WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.from(JSON.stringify(body)).byteLength
            }
        }, resolve);
        
        req.write(JSON.stringify(body));
        req.end();
    });
}

setTimeout(async () => {
    const up = await getPing();
    if(!up) {
        throw 'CoinGecko API is down';
    }

    priceCache.push(await getBTCPrice()); // always a price to compare

    setInterval(async () => {
        const up = await getPing();
        if(!up) {
            console.log('CoinGecko API is down, waiting.');
            return;
        }

        const price = await getBTCPrice();
        const lastPrice = priceCache[priceCache.length - 1];
        priceCache.push(price);

        if(price === lastPrice) {
            console.log('No change in price.');
        } else {
            const diff = (((price - lastPrice) / Math.abs(lastPrice))) * 100;
            const total_diff = (((priceCache[0] - lastPrice) / Math.abs(lastPrice))) * 100;
            console.log('Price change: %d%', diff);
            console.log('last check price: ' + lastPrice, 'now price: ' + price);
            return sendWebhook(total_diff, diff);
        }
    }, 60 * 1000 * 5); // 5 minutes
}, 10);