const fs = require('fs');
const mkdirp = require('mkdirp');
const request = require('request');
const Promise = require('bluebird');
const remote = require('remote-file-size');
const Progress = require('clui').Progress;


const requestWrapper = require('../util/requestWrapper');
const config = require('../config');
const manipulation = require('./manipulation');

const downloadVideoAux = (url, destination, remoteSize, resolve, reject) => {
    const downloadProgress = new Progress(20);
    let sizeThusFar = 0;
    console.log("Video size:", (remoteSize / (1024 * 1024)).toFixed(), 'MB');
    request
        .get(url)
        .on('data', data => {
            sizeThusFar += data.length;
            process.stdout.cursorTo(0);
            process.stdout.write(downloadProgress.update(sizeThusFar, remoteSize));
        }).on('error', err => reject(err))
        .on('end', () => {
            console.log();
            resolve()
        }).pipe(fs.createWriteStream(destination));
};

const downloadVideo = (url, destination) =>
    new Promise((resolve, reject) => {
        remote(url, (err, remoteSize) => {
            fs.access(destination, fs.F_OK, fileDoesntExist => {
                if (fileDoesntExist)
                    downloadVideoAux(url, destination, remoteSize, resolve, reject);
                else {
                    const stats = fs.statSync(destination);
                    const localSize = stats["size"];
                    if (!err && remoteSize == localSize) {
                        console.log("Found video in raw folder");
                        resolve();
                    }
                    else
                        downloadVideoAux(url,destination, remoteSize, resolve, reject);
                }
            });
        });
    });

const downloadTranscripts = speeches =>
    Promise.all(speeches.map(speech =>
        new Promise(resolve => {
            requestWrapper.get(speech.speechDataUrl + '.json', resObject => {
                if (!resObject)
                    return resolve(null);
                resolve({
                    text: resObject['anforande']['anforandetext'],
                    debateTurn: speech.debateTurn
                });
            });
        })
    ));


const downloadCatalogue = (catalogue, rootDir, discardRaws) => {
    const videoIds = Object.keys(catalogue);
    const rawDir = rootDir + 'raw/';
    mkdirp.sync(rawDir);

    console.log("Downloading", videoIds.length, "videos");
    Promise.reduce(videoIds, (acc, videoId, index, len) => {
        const videoUrl = catalogue[videoId].downloadUrl;
        const filePath = rawDir + videoId + '.mp4';
        console.log("Downloading video", index, 'of', len, ' ==> Video ID', videoId);
        return downloadVideo(videoUrl, filePath
            ).then(() => downloadTranscripts(catalogue[videoId].speeches)
            ).then(transcripts =>
                manipulation.splitTranscripts(videoId, transcripts, rootDir)
            ).then(() =>
                manipulation.extractAndSplitAudio(filePath, videoId, catalogue[videoId].speeches, rootDir)
            ).then(() =>
                manipulation.discardRaws(filePath, discardRaws)
            );
    });
};

module.exports = {
    downloadCatalogue: downloadCatalogue
};