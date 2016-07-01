const requests = require('./requests');
const transforms = require('./transforms');
const filters = require('./filters');

const getVideoUrl = speech =>
    requests.getDebateVideoData(speech.debateId
    ).then(transforms.getIntermediateVideoUrl
    ).then(requests.getVideoUrl
    ).then(videoUrl => {
        speech.videoUrl = videoUrl;
        return speech;
    });

const getSpeechMetadata = queryParameters =>
    requests.getSpeechData(queryParameters
    ).filter(filters.notAfter(queryParameters.to)
    ).then(speeches => {
        console.log('Number of speeches', speeches.length);
        return speeches;
    }).map(getVideoUrl
    ).map(speech => {
        speech.videoId = transforms.getVideoIdFromUrl(speech.videoUrl);
        return speech;
    }).filter(filters.removeNull
    ).map(speech => {
        return requests.getDebateTimestamps(speech.debateId, speech.debateTurn).then(timestamp => {
            if (!timestamp) return null;
            speech.start = timestamp.start;
            speech.duration = timestamp.duration;
            return speech;
        })

    }).filter(filters.removeNull);



module.exports = {
    getSpeechMetadata: getSpeechMetadata
};
