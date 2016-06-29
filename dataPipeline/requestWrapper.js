const config = require('../config');
const urls = require('./urls');
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
        if (err || res.statusCode == 404) callback(null);
        else if (res.statusCode !== 200) {
            setTimeout(() => {
                console.log(res.statusCode);
                console.log(`Too many requests sent, waiting ${config.tooManyRequestsTimeout} seconds before trying again`);
                //get(url, jsonCallback)
                callback(null);
            }, config.tooManyRequestsTimeout)
        } else {
            callback(JSON.parse(body));
        }
    });
};

module.exports = {
    getFromCache: getFromCache,
    get: get
};