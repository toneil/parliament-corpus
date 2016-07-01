const Promise = require('bluebird');
const urls = require('./urls');
const config = require('../config');
const requestWrapper = require('../util/requestWrapper');

const getStartTime = (videoUrl) => videoUrl.split('=')[1];

const yearToSitting = year => year.toString() + '/' + incrementYear(year).toString().substr(2,2);

const incrementYear = year => new Date((parseInt(year.toString()) + 1).toString()).getFullYear();

/*
 * Returns a list of sittings on the form (2014/15) for all sittings
 * in the period between {from} and {to}
 */
const getSittings = (from, to) => {
    const lastYear = new Date(to).getFullYear();
    const sittings = [];
    let year = new Date(from).getFullYear() - 1;
    while (lastYear >= year) {
        sittings.push(yearToSitting(year));
        year = incrementYear(year);
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
const deconstructSpeechRequests = queryParameters => {
    const to = !!queryParameters.to ? queryParameters.to : Date.now();
    const from = !!queryParameters.from ? queryParameters.from : new Date(config.defaultStartDate);
    console.log(from, to)
    const sittings = getSittings(from, to);
    console.log("sittings", sittings);
    return Promise.map(sittings, sitting =>
        new Promise(resolve => {
            queryParameters['rm'] = sitting;
            console.log('Querying', queryParameters);
            requestWrapper.get(urls.speechList(queryParameters), responseObject => {
                if (!responseObject || !responseObject['anforandelista']['anforande'])
                    return resolve([]);

                const speeches = responseObject['anforandelista']['anforande'];
                console.log('got response', speeches.length);
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
            });
        })
    ).reduce((speechList, sublist) => speechList.concat(sublist), []);

};

/*
 */
const getSpeechData = queryParameters =>
    new Promise((resolve, reject) => {
        requestWrapper.get(urls.speechList(queryParameters), responseObject => {
            if (!responseObject) reject();
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
        });
    });

/*
 * Returns a promise containing the start time and duration of {debateTurn} in the video for {debateId}
 */
const getDebateTimestamps = (debateId, debateTurn) =>
    new Promise(resolve => {
        requestWrapper.getFromCache('timestamp', debateId, urls.documentList, responseObject => {
            if (!responseObject)
                return resolve(null);
            const documentList = responseObject['dokumentlista']['dokument'];
            let debateDoc = null;
            if (responseObject['dokumentlista']['@traffar'] === '1')
                debateDoc = documentList;
            else
                debateDoc = documentList.filter(doc => doc['dok_id'] === debateId)[0];
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
    getSpeechData: deconstructSpeechRequests,
    getDebateVideoData: getDebateVideoData,
    getDebateTimestamps: getDebateTimestamps,
    getVideoUrl: getVideoUrl
};