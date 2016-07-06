#! /usr/bin/env node

const getUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const Table = require('cli-table');

const requests = require('../util/requestWrapper');

const option = value => !!value ? value : '-';
const genderToEnglish = gender => {
    if (!gender) return '-';
    if (gender === 'kvinna') return 'f';
    else return 'm';
};

const optionDefinitions = [
    {
        name: 'first-name', alias:'f',
        type: String,
        defaultValue: '',
        description: 'Parliamentarian first name'
    },
    {
        name: 'last-name', alias:'l',
        type: String,
        defaultValue: '',
        description: 'Parliamentarian last name'
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
        header: 'Parliament corpus person lookup tool',
        content: 'Prints ID, constituency, party, birth year and gender for all matching parliamentarians'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    }
];

const options = commandLineArgs(optionDefinitions);

if (options.help) {
    console.log(getUsage(sections));
    process.exit(1);
}

const requestObject = {
    url: 'http://data.riksdagen.se/personlista/',
    qs: {
        fnamn: options['first-name'],
        enamn: options['last-name'],
        utformat: 'json',
        rdlstatus:'samtliga'
    }
};

requests.get(requestObject, responseObject => {
    if (!responseObject || !responseObject['personlista']){
        console.log("No persons matching the criteria");
        process.exit(1);
    }
    if (responseObject['personlista']['@hits'] === "1")
        responseObject['personlista']['person'] = [responseObject['personlista']['person']];
    const personList = responseObject['personlista']['person'].map(person => {
        return [
            option(person['intressent_id']),
            option(person['tilltalsnamn']),
            option(person['efternamn']),
            genderToEnglish(person['kon']),
            option(person['parti']),
            option(person['valkrets'])
        ]
    });
    const table = new Table({
        head: ['Person ID', 'First name', 'Last name', 'Gender', 'Party', 'Constituency'],
        colWidths: [50, 20, 20, 10, 10, 50]
    });
    personList.forEach(person => table.push(person));
    console.log(table.toString());
});
