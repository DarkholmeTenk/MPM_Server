const fetch = require("node-fetch")

exports = module.exports = function(url, options) {
    options = options || {}
    options.headers = options.headers || {}
    options.headers['Accept'] = "application/vnd.github.v3+json"
    return fetch(url, options)
}