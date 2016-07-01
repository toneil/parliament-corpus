
const notAfter = upToOptional =>
    speech => {
        const upTo = !!upToOptional ? new Date(upToOptional) : new Date();
        const speechDate = new Date(speech.date);
        return upTo.getTime() > speechDate.getTime();
    };

const removeNull = speech => !!speech && !!speech.videoId;

module.exports = {
    notAfter: notAfter,
    removeNull: removeNull
};