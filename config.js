
const config = {
    tooManyRequestsTimeout: 30000,
    cacheRequests: true,
    maxSpeechListSize: 1000,

    // The values below can be overridden from the cli
    defaultStartDate: '2000-01-01',
    defaultFileRoot: 'data/'
};

module.exports = config;