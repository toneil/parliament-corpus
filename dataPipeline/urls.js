
module.exports = {
    speechList: personId =>
        `http://data.riksdagen.se/anforandelista/?rm=&anftyp=&d=&ts=&parti=&iid=${personId}&sz=10000&utformat=json`,
    debateMetadata: debateId =>
        `http://www.riksdagen.se/api/videostream/get/${debateId}`,
    documentList: documentId =>
        `http://data.riksdagen.se/dokumentlista/?sok=${documentId}&doktyp=&rm=&from=&tom=&ts=&bet=&tempbet=&nr=&org=&iid=&webbtv=&talare=&exakt=&planering=&sort=rel&sortorder=desc&rapport=1&utformat=json&a=a#soktraff`,
    videoUrlRequest: url => {
        return {
            url: url,
            headers: {
                'user-agent': 'parliament-corpus.v1'
            }
        }
    }
};
