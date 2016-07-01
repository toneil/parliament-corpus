const fs = require('fs');
const mkdirp = require('mkdirp');
const request = require('request');
const Promise = require('bluebird');

const requestWrapper = require('../util/requestWrapper');
const config = require('../config');
const manipulation = require('./manipulation');

const downloadVideo = (url, destination) =>
    new Promise((resolve, reject) => {
        request
            .get(url)
            .on('error', err => reject(err))
            .on('end', () => resolve())
            .pipe(fs.createWriteStream(destination))
    });

const downloadTranscripts = speeches =>
    Promise.all(speeches.map(speech =>
        new Promise(resolve => {
            requestWrapper.get(speech.speechDataUrl + '.json', resObject => {
                resolve({
                    text: resObject['anforande']['anforandetext'],
                    debateTurn: speech.debateTurn
                });
            });
        })
    ));


const downloadCatalogue = catalogue => {
    const videoIds = Object.keys(catalogue);
    const rawDir = config.fileRoot + 'raw/';
    mkdirp.sync(rawDir);

    console.log("Downloading", videoIds.length, "videos");
    Promise.reduce(videoIds, (acc, videoId, index, len) => {
        const videoUrl = catalogue[videoId].downloadUrl;
        const filePath = rawDir + videoId + '.mp4';
        console.log("Downloading video", index, 'of', len, ' ==> Video ID', videoId);
        return downloadVideo(videoUrl, filePath
            ).then(() => downloadTranscripts(catalogue[videoId].speeches)
            ).then(transcripts =>
                manipulation.splitTranscripts(videoId, transcripts)
            ).then(() =>
                manipulation.extractAndSplitAudio(filePath, videoId, catalogue[videoId].speeches)
            );
    });
};

module.exports = {
    downloadCatalogue: downloadCatalogue
};