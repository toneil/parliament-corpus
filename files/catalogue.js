var jsonfile = require('jsonfile');


const createCatalogue = (speeches, cataloguePath) => {
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
    jsonfile.writeFile(cataloguePath, catalogue);
};

const readCatalogue = filePath =>
    jsonfile.readFileSync(filePath);

module.exports = {
    createCatalogue: createCatalogue,
    readCatalogue: readCatalogue
};