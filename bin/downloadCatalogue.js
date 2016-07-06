#! /usr/bin/env node

const getUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');

const catalogue = require('../files/catalogue');
const download = require('../files/download');
const config = require('../config').config;

const optionDefinitions = [
    {
        name: 'cat-path', alias:'c',
        type: String,
        typeLabel: '[underline]{file}',
        description: 'Catalogue input path.'
    },
    {
        name: 'root', alias:'r',
        type: String,
        defaultValue: config.defaultFileRoot,
        typeLabel: '[underline]{path/to/root/}',
        description: `Sets the download root path. Default path: ${config.defaultFileRoot}`
    },
    {
        name: 'discard-raw', alias:'d',
        type: Boolean,
        defaultValue: false,
        description: 'If set, removes raw video files after extracting audio tracks.'
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
        header: 'Parliament corpus catalogue downloader',
        content: 'Downloads text, video and sound data for all speech items in the input catalogue. See the README for more info.'
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

const cat = catalogue.readCatalogue(options['cat-path']);
let rootDir = options['root'];
if (rootDir.lastIndexOf('/') != rootDir.length -1)
    rootDir += '/';
download.downloadCatalogue(cat, rootDir, options['discard-raw']);
