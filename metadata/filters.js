
/*
 * Returns a function that will return true iff {speech} was held before {upToOptional}
 * {upToOptional} may be null.
 */
const notAfter = upToOptional =>
    speech => {
        const upTo = !!upToOptional ? new Date(upToOptional) : new Date();
        const speechDate = new Date(speech.date);
        return upTo.getTime() > speechDate.getTime();
    };

const personFilter = personQuery =>
    personData => {
        if (!personData) return false;
        const ageRange =
            (!personQuery.bornAfter || personData.born >= personQuery.bornAfter) &&
            (!personQuery.bornBefore || personData.born <= personQuery.bornBefore);
        const gender = !personQuery.gender || personQuery.gender === personData.gender;
        const constituency = !personQuery.constituency || personQuery.constituency === personData.constituency;
        return ageRange && gender && constituency;
    };

const removeNull = speech => !!speech && !!speech.videoId;

module.exports = {
    personFilter: personFilter,
    notAfter: notAfter,
    removeNull: removeNull
};