const mkdirp = require('mkdirp');
const config = require('../config');
const fs = require('fs');
const Promise = require('bluebird');
const ffmpeg = require('ffmpeg');
const fluent = require('fluent-ffmpeg');

const stripHtmlTags = string => string.replace(/(<\w+>)/g, '').replace(/(<\/\w+>)/g, '');
const stripStyleRef = string => string.replace(/(STYLEREF.*MERGEFORMAT)/g, '');
const stripIntro = string => string.replace(/([^\s+Svar på interpellationer])/,'');

const splitTranscripts = (videoID, transcripts) => {
    new Promise(resolve => {
         const videoDir = config.fileRoot + videoID +'/';
         mkdirp(videoDir, () => {
             Promise.map(transcripts, transcript => {
                 const transcriptText = stripIntro(stripStyleRef(stripHtmlTags(transcript.text)));
                 return fs.writeFile(videoDir + transcript.debateTurn + '.txt', transcriptText);
             }).then(resolve);
         });
    });
};

const extractAndSplitAudio = (videoPath, videoId, speeches) => {
    const audioRoot = config.fileRoot + videoId + '/';
    speeches.forEach(speech => {
        new fluent({source: videoPath})
            .noVideo()
            .setStartTime(speech.start)
            .setDuration(speech.duration)
            .saveToFile(audioRoot + speech.debateTurn + '.mp3');
    });
};

module.exports = {
    extractAndSplitAudio: extractAndSplitAudio,
    splitTranscripts: splitTranscripts
};