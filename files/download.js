const fs = require('fs');
const mkdirp = require('mkdirp');
const request = require('request');
const Promise = require('bluebird');
const remote = require('remote-file-size');
const Progress = require('clui').Progress;

const requestWrapper = require('../util/requestWrapper');
const config = require('../config');
const manipulation = require('./manipulation');


/*
 * Auxiliary function for downloading videos. Handles the download itself, and prints
 * download info.
 */
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

/*
 * Downloads the video data found at {url} and saves it to {destination},
 * unless that file already exists.
 */
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

/*
 * Returns a promise containing the text content and debate turn of each speech in {speeches}
 */
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

/*
 * Main download function
 */
const downloadCatalogue = (catalogue, rootDir, discardRaws) => {
    const debateIds = Object.keys(catalogue);
    const rawDir = rootDir + 'raw/';
    mkdirp.sync(rawDir);

    console.log("Downloading", debateIds.length, "videos");
    Promise.reduce(debateIds, (acc, debateId, index, len) => {
        const videoUrl = catalogue[debateId].downloadUrl;
        const filePath = rawDir + debateId + '.mp4';
        console.log("Downloading video", index, 'of', len, ' ==> Debate ID', debateId);
        return downloadVideo(videoUrl, filePath
            ).then(() => downloadTranscripts(catalogue[debateId].speeches)
            ).then(transcripts =>
                manipulation.splitTranscripts(debateId, transcripts, rootDir)
            ).then(() =>
                manipulation.extractAndSplitAudio(filePath, debateId, catalogue[debateId].speeches, rootDir)
            ).then(() =>
                manipulation.discardRaws(filePath, discardRaws)
            );
    });
};

module.exports = {
    downloadCatalogue: downloadCatalogue
};