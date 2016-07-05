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
        description: 'Upper time constraint of speeches considered.'
    },
    {
        name: 'from', alias: 'f',
        type: String,
        defaultValue: new Date(config.defaultStartDate),
        typeLabel: '[underline]{yyyy-mm-dd}',
        description: 'Lower time constraint of speeches considered.'
    },
    {
        name: 'individual', alias:'i',
        type: String,
        defaultValue: '',
        description: 'Only consider speeches from a single parliamentarian'
    },
    {
        name: 'party', alias:'p',
        type: String,
        defaultValue: '',
        typeLabel:'[underline]{s,mp,l,v, etc.}',
        description: 'Only consider parliamentarians from a single political party.'
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

const queryParameters = {
    to: new Date(options.to).toISOString(),
    from: new Date(options.from).toISOString(),
    party: options.party,
    personId: options.individual
};

pipeline.getSpeechMetadata(queryParameters).then(speeches => {
    catalogue.createCatalogue(speeches, options['cat-path'], options['append'])
});