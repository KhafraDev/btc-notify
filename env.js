const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

/**
 * Who needs dotenv?
 * Don't use this anywhere important, I wrote this in 2 minutes for 1 variable.
 */
const env = () => {
    if(!existsSync(join(__dirname, '.env'))) {
        return null;
    }

    const e = readFileSync('.env').toString().split(/\n|\r|\r\n/g).map(v => v.split('='));
    for(const [k, v] of e) {
        if(k in process.env) {
            throw 'Env variable ' + k + ' already exists!';
        }

        Object.defineProperty(process.env, k, {
            value: v,
            enumerable: true,
            writable: false
        });
    }
}

module.exports = env;