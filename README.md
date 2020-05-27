# BTC-Notify
* Get notified on the current price of BTC.
* If price goes up/down 10%, get a notification on Discord.

# Dependencies
* No 3rd party dependencies.
* https, fs, path.

# Setup
## Requirements
1. NodeJS (probably v12+).
2. Discord account (free).

## Steps
* Set up a Discord webhook in the channel you want to get notifications in.
* Add webhook URL to [env](.env) file.
* ``node index`` 