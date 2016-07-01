const config = require('../config');
const urls = require('./../metadata/urls');
const request = require('request');
const Promise = require('bluebird');

const documentStore = {};

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
        })
    }
    documentStore[namespace][documentId].then(callback);
};

const get = (req, callback) => {
    request(req, (err, res, body) => {
        if (err && err.code === 'ECONNRESET') {
            console.log(`Too many requests sent, waiting ${config.tooManyRequestsTimeout} seconds before trying again`);
            setTimeout(() => {
                get(req, callback)
            }, config.tooManyRequestsTimeout)
        }
        else if (err || res.statusCode !== 200) {
            if (!!res)
                console.log("Request failed with code", res.statusCode);
            if (!!err)
                console.log("Request threw error", err.code);
            callback(null);
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