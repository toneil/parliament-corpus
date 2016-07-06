const config = require('../config').config;

const optional = x => !!x ? x : '';

module.exports = {
    person: personId =>
        `http://data.riksdagen.se/personlista/?iid=${personId}&fnamn=&enamn=&f_ar=&kn=&parti=&valkrets=&rdlstatus=&org=&utformat=json&termlista=`,
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
            d: optional(query.from).substr(0,10),
            iid: optional(query.personId),
            parti: optional(query.party),
            rm: optional(query.rm),
            utformat: 'json',
            sz: config.maxSpeechListSize
        };
        return {
            url: 'http://data.riksdagen.se/anforandelista/',
            qs: queryParameters
        };
    }
};
