#! /usr/bin/env node

const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');

const pipeline = require('../metadata');
const catalogue = require('../files/catalogue');
const config = require('../config');

const optionDefinitions = [
    {
        name: 'cat-path', alias:'c',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'Catalogue output path.'
    },
    {
        name: 'append', alias:'a',
        type: Boolean,
        defaultValue: false,
        description: 'If set, appends search results to existing catalogue. Otherwise, existing data is overwritten.'
    },
    {
        name: 'to',  alias: 't',
        type: String,
        defaultValue: Date.now(),
        typeLabel: '[underline]{yyyy-mm-dd}',
        description: 'Only include speeches before this date'
    },
    {
        name: 'from', alias: 'f',
        type: String,
        defaultValue: new Date(config.config.defaultStartDate),
        typeLabel: '[underline]{yyyy-mm-dd}',
        description: 'Only include speeches after this date'
    },
    {
        name: 'born-after',
        type: String,
        typeLabel: '[underline]{yyyy}',
        description: 'Only include speeches held by parliamentarians born after this year'
    },
    {
        name: 'born-before',
        type: String,
        typeLabel: '[underline]{yyyy}',
        description: 'Only include speeches held by parliamentarians born before this year'
    },
    {
        name: 'gender',
        type: String,
        typeLabel: '[underline]{m/f}',
        description: 'Only include speeches held by parliamentarians of one gender'
    },
    {
        name: 'constituency',
        type: String,
        description: 'Only include speeches held by parliamentarians of this constituency'
    },
    {
        name: 'individual', alias:'i',
        type: String,
        defaultValue: '',
        description: 'Given a person ID, only include speeches from that parliamentarian. Use corpus-lookup to find IDs'
    },
    {
        name: 'party', alias:'p',
        type: String,
        defaultValue: '',
        typeLabel:'[underline]{s,mp,l,v, etc.}',
        description: 'Only include speeches held by parliamentarians from a single political party'
    },
    {
        name: 'timeout',
        type: Number,
        description: `Sets the number of ms to wait after request failures before trying again, default ${config.config.tooManyRequestsTimeout}`
    },
    {
        name: 'no-cache',
        type: Boolean,
        description: 'If set, will not cache requests to the Parliament API (not recommended)'
    },
    {
        name: 'request-size',
        type: Number,
        description: `Sets the maximum expected list size for speech list requests.
        Higher values can cause the tool to malfunction. Lower values will clip speech items held early in the year. Default ${config.config.maxSpeechListSize}`
    },
    {
        name: 'help', alias:'h',
        type: Boolean,
        defaultValue: false,
        description: 'Print this usage guide.'
    }

];

const sections = [
    {
        header: 'Parliament corpus catalogue builder',
        content: 'Builds corpus metadata files. See the README for more info.'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    }
];


const options = commandLineArgs(optionDefinitions);

if (!options['cat-path'] || !!options.help) {
    console.log(getUsage(sections));
    process.exit(1);
}

if (!!options['timeout'])
    config.setField('tooManyRequestsTimeout', options['timeout']);

if(!!options['no-cache'])
    config.setField('cacheRequests', false);
if(!!options['request-size'])
    config.setField('maxSpeechListSize', options['request-size']);

const queryParameters = {
    person: {
        bornAfter: options['born-after'],
        bornBefore: options['born-before'],
        gender: options['gender'],
        constituency: options['constituency']
    },
    to: new Date(options.to).toISOString(),
    from: new Date(options.from).toISOString(),
    party: options.party,
    personId: options.individual
};

pipeline.getSpeechMetadata(queryParameters).then(speeches => {
    catalogue.createCatalogue(speeches, options['cat-path'], options['append'])
});