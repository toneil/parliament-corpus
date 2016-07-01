const optional = x => !!x ? x : '';

module.exports = {
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
    },
    speechList: query => {
        const queryParameters = {
            d: optional(query.from),
            iid: optional(query.personId),
            parti: optional(query.party),
            utformat: 'json',
            sz: '10000'
        };
        return {
            url: 'http://data.riksdagen.se/anforandelista/',
            qs: queryParameters
        };
    }
};
