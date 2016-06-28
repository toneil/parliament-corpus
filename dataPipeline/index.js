const requests = require('./requests');
const transforms = require('./transforms');

const getVideoUrl = speech =>
    requests.getDebateVideoData(speech.debateId
    ).then(transforms.getIntermediateVideoUrl
    ).then(requests.getVideoUrl
    ).then(videoUrl => {
        speech.videoUrl = videoUrl;
        return speech;
    });

const getVideoMetadata = personId =>
    requests.getSpeechData(personId
    ).map(getVideoUrl
    ).map(speech => {
        speech.videoId = transforms.getVideoIdFromUrl(speech.videoUrl);
        return speech;
    }).filter(speech => !!speech.videoId
    ).map(speech =>
        requests.getDebateTimestamps(speech.debateId, speech.debateTurn).then(timestamp => {
            speech.start = timestamp.start;
            speech.duration = timestamp.duration;
            return speech;
        })
    );


module.exports = {
    getVideoMetadata: getVideoMetadata
};
