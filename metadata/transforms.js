/*
 * Given some recording metadata, returns an intermediate URL where
 * the proper recording URL can be found.
 */
const getIntermediateVideoUrl = videoData => {
    if (!videoData || !videoData['streams']) return null;
    let intermediateUrl = null;
    videoData['streams']['files'].forEach(stream => {
        if (stream['mimetype'] === 'video/mp4') {
            intermediateUrl = stream['url'];
        }
    });
    return intermediateUrl;
};

const getVideoIdFromUrl = videoUrl => {
    if (!videoUrl) return null;
    const splitString = videoUrl.split('/');
    return splitString[splitString.length-1].split('.')[0];
};

module.exports = {
    getIntermediateVideoUrl: getIntermediateVideoUrl,
    getVideoIdFromUrl: getVideoIdFromUrl
};