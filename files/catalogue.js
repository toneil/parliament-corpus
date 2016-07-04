var jsonfile = require('jsonfile');


const createCatalogue = (speeches, cataloguePath, append) => {
    const catalogue = speeches.reduce((cat, speech) => {
        if (!cat.hasOwnProperty(speech.videoId))
            cat[speech.videoId] = {
                speeches: [],
                downloadUrl: speech.videoUrl
            };
        const segmentMetadata = {
            personId: speech.personId,
            start: speech.start,
            duration: speech.duration,
            speechDataUrl: speech.speechDataUrl,
            debateTurn: speech.debateTurn
        };
        cat[speech.videoId].speeches.push(segmentMetadata);
        return cat;
    }, {});
    if (append) {
        const existingCat = jsonfile.readFileSync(cataloguePath);
        existingCat.videoIds.forEach(videoId => {
           if (!catalogue.hasOwnProperty(videoId)) {
               catalogue[videoId] = existingCat[videoId];
           } else {
               existingCat[videoId].speeches.forEach(existingSpeech => {
                    const inCat = catalogue[videoId].speeches.some(speech =>
                        speech.debateTurn === existingSpeech.debateTurn
                    );
                    if (!inCat)
                        catalogue[videoId].speeches.push(existingSpeech);
               });
           }
        });
    }
    jsonfile.writeFile(cataloguePath, catalogue);
};

const readCatalogue = filePath =>
    jsonfile.readFileSync(filePath);

module.exports = {
    createCatalogue: createCatalogue,
    readCatalogue: readCatalogue
};