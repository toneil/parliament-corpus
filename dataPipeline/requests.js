const Promise = require('bluebird');
const urls = require('./urls');
const config = require('../config');
const requestWrapper = require('./requestWrapper');

const getStartTime = (videoUrl) => videoUrl.split('=')[1];

const getSpeechData = personId =>
    new Promise((resolve, reject) => {
        requestWrapper.get(urls.speechList(personId), responseObject => {
            if (!responseObject) reject();
            const speeches = responseObject['anforandelista']['anforande'];
            const speechData = speeches.map(speech => {
                return {
                    personId: speech['intressent_id'],
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
        requestWrapper.getFromCache(debateId, responseObject => {
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
        requestWrapper.get(urls.debateMetadata(debateId), responseObject => {
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
        requestWrapper.get(requestObject, responseObject => {
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