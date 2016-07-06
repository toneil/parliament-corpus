
const config = {
    // The values below can be overridden from the cli

    tooManyRequestsTimeout: 30000,
    cacheRequests: true,
    maxSpeechListSize: 1000,
    defaultStartDate: '2000-01-01',
    defaultFileRoot: 'data/'
};

const setField = (field, value) => config[field] = value;

module.exports = {
    config: config,
    setField: setField
};