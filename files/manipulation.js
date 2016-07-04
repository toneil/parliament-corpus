const mkdirp = require('mkdirp');
const config = require('../config');
const fs = require('fs');
const Promise = require('bluebird');
const ffmpeg = require('fluent-ffmpeg');

const stripHtmlTags = string => string.replace(/(<\w+>)/g, '').replace(/(<\/\w+>)/g, '');
const stripStyleRef = string => string.replace(/(STYLEREF.*MERGEFORMAT)/g, '');
const stripIntro = string => string.replace(/([^\s+[A-Z][a-z]+])/,'');

const splitTranscripts = (videoID, transcripts, rootDir) => {
    new Promise(resolve => {
         const videoDir = rootDir + videoID +'/';
         mkdirp(videoDir, () => {
             Promise.map(transcripts, transcript => {
                 if (!transcript)
                    return Promise.resolve();
                 const transcriptText = stripIntro(stripStyleRef(stripHtmlTags(transcript.text)));
                 return fs.writeFile(videoDir + transcript.debateTurn + '.txt', transcriptText);
             }).all().then(resolve);
         });
    });
};

const discardRaws = (filePath, discardRaws) => {
    if (discardRaws)
        fs.unlink(filePath);
    return true;
};

const extractAndSplitAudio = (videoPath, videoId, speeches, rootDir) => {
    const audioRoot = rootDir + videoId + '/';
    console.log("Extracting mp3 from", videoPath);
    return Promise.map(speeches, speech =>
        new Promise(resolve => {
            ffmpeg(videoPath)
                .noVideo()
                .setStartTime(speech.start)
                .setDuration(speech.duration)
                .on('end', resolve)
                .output(audioRoot + speech.debateTurn + '.mp3')
                .run();
        })
    ).all();
};
module.exports = {
    extractAndSplitAudio: extractAndSplitAudio,
    splitTranscripts: splitTranscripts,
    discardRaws: discardRaws
};