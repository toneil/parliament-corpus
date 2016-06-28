const Promise = require('bluebird');
const requests = require('./dataPipeline/requests');
const transforms = require('./dataPipeline/transforms');


const getVideoMetadata = personId => {
    return requests.getSpeechData(personId
    ).map(speech => new Promise(resolve  => {
        requests.getDebateVideoData(speech.debateId).then(videoData => {
            speech.videoData = videoData;
            resolve(speech)
        });
    })).map(speech => {
        speech.intermediaVideoUrl = transforms.getIntermediateVideoUrl(speech.videoData);
        return speech;
    }).map(speech => new Promise(resolve => {
        requests.getVideoUrl(speech.intermediaVideoUrl).then(videoUrl => {
            speech.videoUrl = videoUrl;
            resolve(speech)
        });
    })).map(speech => {
        speech.videoId = transforms.getVideoIdFromUrl(speech.videoUrl);
        return speech;
    }).filter(speech => !!speech.videoId);
};



module.exports = {
    getVideoMetadata: getVideoMetadata
};
