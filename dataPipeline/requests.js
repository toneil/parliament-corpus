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

const getStartTime = (videoUrl) => videoUrl.split('=')[1];

const getSpeechData = personId =>
    new Promise((resolve, reject) => {
        requestWrapper(urls.speechList(personId), responseObject => {
            if (!responseObject) reject();
            const speeches = responseObject['anforandelista']['anforande'];
            const speechData = speeches.map(speech => {
                return {
                    debateId: speech['rel_dok_id'],
                    speechDataUrl: speech['anforande_url_xml'],
                    debateTurn: speech['anforande_nummer']
                };
            });
            resolve(speechData);
        });
    });

const getDebateTimestamps = (debateId, debateTurn) =>
    new Promise(resolve => {
        requestWrapper(urls.documentList(debateId), responseObject => {
            const documentList = responseObject['dokumentlista']['dokument'];
            let debateDoc = null;
            if (responseObject['dokumentlista']['@traffar'] === '1')
                debateDoc = documentList;
            else
                debateDoc = documentList.filter(doc => doc['dok_id'] === debateId)[0];
            debateDoc['debatt']['anforande'].forEach(speech => {
                if (speech['anf_nummer'] === debateTurn)
                    resolve({
                        start: getStartTime(speech['video_url']),
                        duration: speech['anf_sekunder']
                    });
            });
            resolve(null);
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
    getDebateTimestamps: getDebateTimestamps,
    getVideoUrl: getVideoUrl
};