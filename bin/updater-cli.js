#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const { contentInserter } = require('../lib/inserter');

require('dotenv').config();

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
    .name('updater-cli')
    .argument('<file1>', 'input file')
    .argument('<file2>', 'update file')
    .option('--tag <tagname>','content tag',process.env.CONTENT_TAG)
    .option('-o,--overwrite','overwrite existing content',false)
    .option('-s,--similarity <score>','ignore text with a score larger')
    .action( async (file1,file2,options) => {
        const content1 = fs.readFileSync(file1, { encoding: 'utf8' });
        const content2 = fs.readFileSync(file2, { encoding: 'utf8' });
        const newContent = await contentInserter(content1,content2,options);
        if (newContent) {
            console.log(newContent);
        }
    });

program.parse();