const config = require('../config').config;
const urls = require('../metadata/urls');
const request = require('request');
const Promise = require('bluebird');

const documentStore = {};

/*
 * Caches results from the Parliament API, since many individual speech items
 * share common requests. Caching reduces the number of requests sent by up to 80%.
 *
 * Caching can be enabled/disabled in the config file in the root folder.
 *
 * Unless memory shortage is an issue, caching should be used so as to speed up data
 * collection as well as to spare the Parliament API the extra traffic.
 *
 * Cached objects are organised by namespace (e.g. video data, speech data) and then document ID
 */
const getFromCache = (namespace, documentId, urlFunction, callback) => {
    if (!config.cacheRequests)
        return get(urlFunction(documentId), callback);
    if (!documentStore.hasOwnProperty(namespace))
        documentStore[namespace] = {};
    if (!documentStore[namespace].hasOwnProperty(documentId)) {
        documentStore[namespace][documentId] = new Promise(resolve => {
            get(urlFunction(documentId), responseObject => {
                resolve(responseObject);
            });
        });
    }
    documentStore[namespace][documentId].then(callback);
};

/*
 * Wraps requests to the Parliament API to safeguard from such service refusals that can happen
 * due to excesses of requests. If too many requests are sent at once, refused requests will be
 * set on a timeout, specified in the config file in the root folder.
 */
const get = (req, callback, isCritical) => {
    request(req, (err, res, body) => {
        if (err && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code == 'ECONNREFUSED')) {
            console.error(`Got error ${err.code} when calling ${req}, waiting ${config.tooManyRequestsTimeout} ms before trying again`);
            setTimeout(() => {
                get(req, callback)
            }, config.tooManyRequestsTimeout);
        }
        else if (err || res.statusCode !== 200) {
            if (!!res)
                console.error("Request", req, "failed with code", res.statusCode);
            if (!!err)
                console.error("Request", req, "threw error", err.code);
            if (!!isCritical) {
                console.error(`Critical request failed ${req}, waiting ${config.tooManyRequestsTimeout} ms before trying again`);
                setTimeout(() => {
                    get(req, callback, true)
                }, config.tooManyRequestsTimeout);
            } else {
                callback(null);
            }
        }
        else {
            callback(JSON.parse(body));
        }
    });
};

module.exports = {
    getFromCache: getFromCache,
    get: get
};