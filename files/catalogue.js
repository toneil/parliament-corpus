var jsonfile = require('jsonfile');

/*
 * Creates a dictionary mapping debate IDs to speech items in {speeches}
 * and writes it to a file. If {append} is set to true, any previous contents of the output file
 * will be retained.
 */
const createCatalogue = (speeches, cataloguePath, append) => {
    const catalogue = speeches.reduce((cat, speech) => {
        if (!cat.hasOwnProperty(speech.debateId))
            cat[speech.debateId] = {
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
        cat[speech.debateId].speeches.push(segmentMetadata);
        return cat;
    }, {});
    if (append) {
        const existingCat = jsonfile.readFileSync(cataloguePath);
        Object.keys(existingCat).forEach(debateId => {
           if (!catalogue.hasOwnProperty(debateId)) {
               catalogue[debateId] = existingCat[debateId];
           } else {
               existingCat[debateId].speeches.forEach(existingSpeech => {
                    const inCat = catalogue[debateId].speeches.some(speech =>
                        speech.debateTurn === existingSpeech.debateTurn
                    );
                    if (!inCat)
                        catalogue[debateId].speeches.push(existingSpeech);
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