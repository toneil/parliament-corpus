
module.exports = {
    speechList: personId =>
        `http://data.riksdagen.se/anforandelista/?rm=&anftyp=&d=&ts=&parti=&iid=${personId}&sz=10000&utformat=json`,
    debateMetadata: debateId =>
        `http://www.riksdagen.se/api/videostream/get/${debateId}`
};
