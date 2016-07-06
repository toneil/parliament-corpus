const requests = require('./requests');
const transforms = require('./transforms');
const filters = require('./filters');

/*
 * Most debates from 2005 and onwards are recorded.
 *
 * Given a debate ID, returns a promise containing a URL to its recording.
 */
const getVideoUrl = debateId =>
    requests.getDebateVideoData(debateId
    ).then(transforms.getIntermediateVideoUrl
    ).then(requests.getVideoUrl
    ).then(videoUrl => {
        speech.videoUrl = videoUrl;
        return speech;
    });

/*
 * Given a set of query parameters, returns a promise containing
 * a list of all matching speech items. A speech item has the following properties
 *
 * personId         - Unique ID of the speaker
 * party            - Political party of the speaker
 * debateId         - Unique ID of the debate to which the speech belongs
 * debateTurn       - Identifies the speech within the context of a debate
 * speechDataUrl    - A URL to an XML file containing the speech transcript
 * date             - The date of the speech
 * videoUrl         - A URL to the recording of the debate to which the speech belongs
 */
const getSpeechMetadata = queryParameters =>
    requests.getSpeechList(queryParameters
    ).filter(filters.notAfter(queryParameters.to)
    ).map(speech => getVideoUrl(speech.debateId)
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

    }).filter(filters.removeNull
    ).tap(speeches => console.log('Found', speeches.length, 'speech items'));

module.exports = {
    getSpeechMetadata: getSpeechMetadata
};
