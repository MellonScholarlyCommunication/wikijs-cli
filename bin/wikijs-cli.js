#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const { updatePage, listPage, getPage, listPageFields } = require('../lib/index');

require('dotenv').config();

const BASE_URL = process.env.WIKIJS_URL;
const ACCESS_TOKEN = process.env.WIKIJS_ACCESS_TOKEN;

const log4js = require('log4js');
const logger = log4js.getLogger();

log4js.configure({
    appenders: {
      stderr: { type: 'stderr' }
    },
    categories: {
      default: { appenders: ['stderr'], level: process.env.LOG4JS ?? 'INFO' }
    }
});

program
    .name('wikijs-cli')
    .option('--url <url>','wiki.js host',BASE_URL)
    .option('--token','wikijs access token',ACCESS_TOKEN);

program
    .command('list-page-fields')
    .action( async (options) => {
        options = {...options,...program.opts()};
        const fields = await listPageFields(options);

        if (fields) {
            console.log(JSON.stringify(fields,null,2));
        }
    });

program
    .command('list-page')
    .action( async () => {
        options = program.opts();
        const result = await listPage(options);

        console.log(JSON.stringify(result,null,2));
    });
 
program
    .command('get-page')
    .argument('<id>','page id')
    .option('-f,--field <field>','field to display','content')
    .option('-t,--text','only text content')
    .action( async (id,options) => {
        options = {...options,...program.opts()};
        const field  = options.field;
        const result = await getPage(id,options);

        if (field === '*') {
            console.log(JSON.stringify(result,null,2));
        }
        else if (options.text) {
            console.log(result.content)
        }
        else {
            console.log(result[field]);
        }
    });

program
    .command('update-page')
    .argument('<id>','page id')
    .argument('<file>','update file')
    .option('-t,--text','only text update')
    .action( async (id,file,options) => { 
        options = {...options,...program.opts()};
        const text = fs.readFileSync(file, { encoding: 'utf8' });
        let result;

        if (options.text) {
            result = await updatePage(id,{ content: text },options);
        }
        else {
            result = await updatePage(id, JSON.parse(text),options);
        }
        
        let exitCode = 0;

        if (result) {
            console.log(JSON.stringify(result,null,2));
            exitCode = result.errorCode == 0 ? 0 : 2;
        }
        else {
            exitCode = 2;
        }

        process.exit(exitCode);
    });

program.parse();
