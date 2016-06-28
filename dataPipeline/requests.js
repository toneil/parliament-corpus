const request = require('request');
const Promise = require('bluebird');
const urls = require('./urls');
const config = require('../config');

const requestWrapper = (url, jsonCallback) => {
    request(url, (err, res, body) => {
        if (err || res.statusCode == 404) jsonCallback(null);
        else if (res.statusCode !== 200) {
            setTimeout(() => {
                console.log(res.statusCode);
                console.log(`Too many requests sent, waiting ${config.tooManyRequestsTimeout} seconds before trying again`);
                //requestWrapper(url, jsonCallback)
                jsonCallback(null);
            }, config.tooManyRequestsTimeout)
        } else {
            jsonCallback(JSON.parse(body));
        }
    });
};

const getSpeechData = personId =>
    new Promise((resolve, reject) => {
        requestWrapper(urls.speechList(personId), responseObject => {
            if (!responseObject) reject();
            const speeches = responseObject['anforandelista']['anforande'];
            const speechData = speeches.map(speech => {
                return {
                    debateId: speech['rel_dok_id'],
                    speechDataUrl: speech['anforande_url_xml']
                };
            });
            resolve(speechData);
        });
    });

const getDebateVideoData = debateId =>
    new Promise(resolve => {
        if (!debateId) return resolve(null);
        requestWrapper(urls.debateMetadata(debateId), responseObject => {
            if (!responseObject) return resolve(null);
            const videoData = responseObject['videodata'][0];
            resolve(videoData);
        });
    });

const getVideoUrl = intermediateVideoUrl =>
    new Promise(resolve => {
        if (!intermediateVideoUrl) return resolve(null);
        const requestObject = {
            url:intermediateVideoUrl,
            headers: {
                'user-agent': 'parliament-corpus.v1'
            }
        };
        requestWrapper(requestObject, responseObject => {
            if (!responseObject) return resolve(null);
            const url = responseObject.url;
            resolve(url);
        });
    });


module.exports = {
    getSpeechData: getSpeechData,
    getDebateVideoData: getDebateVideoData,
    getVideoUrl: getVideoUrl
};