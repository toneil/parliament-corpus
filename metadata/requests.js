const Promise = require('bluebird');
const urls = require('./urls');
const config = require('../config');
const requestWrapper = require('../util/requestWrapper');

const getStartTime = (videoUrl) => videoUrl.split('=')[1];

const getYear = date => parseInt(date.substr(0,4));

/*
 * E.g. 2014 => 2014/15
 */
const yearToSitting = year => year.toString() + '/' + (year + 1).toString().substr(2,2);

/*
 * Returns a list of sittings on the form (2014/15) for all sittings
 * in the period between {from} and {to}
 */
const getSittings = (from, to) => {
    const lastYear = getYear(to);
    const sittings = [];
    let year = getYear(from) - 1;
    while (lastYear >= year) {
        sittings.push(yearToSitting(year));
        year += 1;
    }
    return sittings;
};

/*
 * Returns a promise containing all speech items satisfying the constraints of {queryParameters}
 * See data.riksdagen.se/anforandelista for more information
 *
 * The Parliament API can only return 20'000 speech items.
 * Calls are therefore deconstructed so as to target
 * individual sittings (years), with 15k items on average.
 */
const getSpeechList = queryParameters => {
    const to = !!queryParameters.to ? queryParameters.to : Date.now();
    const from = !!queryParameters.from ? queryParameters.from : new Date(config.defaultStartDate);
    const sittings = getSittings(from, to);
    return Promise.map(sittings, sitting =>
        new Promise(resolve => {
            queryParameters['rm'] = sitting;
            requestWrapper.get(urls.speechList(queryParameters), responseObject => {
                if (!responseObject || !responseObject['anforandelista']['anforande']) {
                    return resolve([]);
                }
                const speeches = responseObject['anforandelista']['anforande'];
                const speechData = speeches.map(speech => {
                    return {
                        personId: speech['intressent_id'],
                        party: speech['parti'],
                        debateId: speech['rel_dok_id'],
                        speechDataUrl: speech['anforande_url_xml'],
                        date: speech['dok_datum'],
                        debateTurn: speech['anforande_nummer']
                    };
                });
                resolve(speechData);
            }, true);
        })
    ).reduce((speechList, sublist) => speechList.concat(sublist), []);

};

/*
 * Returns a promise containing the start time and duration of {debateTurn} in the video for {debateId}
 */
const getDebateTimestamps = (debateId, debateTurn) =>
    new Promise(resolve => {
        requestWrapper.getFromCache('timestamp', debateId, urls.documentList, responseObject => {
            if (!responseObject || !responseObject['dokumentlista'] || !responseObject['dokumentlista']['dokument'])
                return resolve(null);
            const documentList = responseObject['dokumentlista']['dokument'];
            let debateDoc = null;
            if (responseObject['dokumentlista']['@traffar'] === '1')
                debateDoc = documentList;
            else
                debateDoc = documentList.filter(doc => doc['dok_id'] === debateId)[0];
            if (!debateDoc || !debateDoc['debatt'] || !debateDoc['debatt']['anforande'])
                return resolve(null);
            if (!Array.isArray(debateDoc['debatt']['anforande']))
                debateDoc['debatt']['anforande'] = [debateDoc['debatt']['anforande']];
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

/*
 * Returns a promise containing various metadata for the recording
 * of the debate identified by {debateId}
 */
const getDebateVideoData = debateId =>
    new Promise(resolve => {
        if (!debateId) return resolve(null);
        requestWrapper.getFromCache('videoData', debateId, urls.debateMetadata, responseObject => {
            if (!responseObject) return resolve(null);
            const videoData = responseObject['videodata'][0];
            resolve(videoData);
        });
    });

/*
 * The URL of a given debate video is specified in a document reached by {intermediateVideoUrl}
 * Returns a promise containing said video URL
 */
const getVideoUrl = intermediateVideoUrl =>
    new Promise(resolve => {
        if (!intermediateVideoUrl) return resolve(null);
        requestWrapper.getFromCache('videoUrl', intermediateVideoUrl, urls.videoUrlRequest, responseObject => {
            if (!responseObject) return resolve(null);
            const url = responseObject.url;
            resolve(url);
        });
    });


module.exports = {
    getSpeechList: getSpeechList,
    getDebateVideoData: getDebateVideoData,
    getDebateTimestamps: getDebateTimestamps,
    getVideoUrl: getVideoUrl
};