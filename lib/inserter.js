const { stringSimilarity } = require("string-similarity-js");

const log4js = require('log4js');
const logger = log4js.getLogger();

async function contentInserter(content1,content2,options) {
    const tagSection = parseTextForTag(content1,options.tag);

    let isSeen = false;

    if (options.similarity) {
        logger.debug(`processin similarity scores ${options.similarity}`);

        for (let i = 0 ; i < tagSection.length ; i++) {
            const old = tagSection[i];
            let score = stringSimilarity(old,content2);

            logger.debug(`Old: ${old}`);
            logger.debug(`New: ${content2}`);
            logger.debug(`Similariry: ${score}`);

            if (score > options.similarity) {
                logger.info(`Score (${score}): ignoring ${content2}`);
                isSeen = true;
            }
        }

        if (! isSeen) {
            tagSection.push(content2);
        }
    }
    else {
        tagSection.push(content2);
    }

    if (! isSeen) {
        const contentNew = updateTextWithTagSection(content1,options.tag,tagSection);

        return contentNew;
    }
    else {
        return null;
    }
}

function parseTextForTag(text,tag) {
    const result = [];

    const lines = text.split("\n");

    let isTag = false;

    for (let i = 0 ; i < lines.length ; i++) {
        if (lines[i].startsWith(`{/${tag}}`)) {
            isTag = false;   
            continue;
        }
        else if (lines[i].startsWith(`{${tag}}`)) {
            isTag = true;
            continue;
        }

        if (isTag && lines[i].match(/\S/g)) {
            result.push(lines[i]);
        }
    }

    return result;
}

function updateTextWithTagSection(text,tag,section) {
    let result = [];

    const lines = text.split("\n");

    let isTag = false;

    for (let i = 0 ; i < lines.length ; i++) {
        if (lines[i].startsWith(`{/${tag}}`)) {
            isTag = false;   
            result.push(`{${tag}}`);
            for (let j = 0 ; j < section.length ; j++) {
                if (j>0) {
                    result.push('');
                }
                result.push(section[j]);
            }
            result.push(`{/${tag}}`);
            continue;
        }
        else if (lines[i].startsWith(`{${tag}}`)) {
            isTag = true;
            continue;
        }

        if (! isTag) {
            result.push(lines[i]);
        }
    }

    return result.join("\n");
}

module.exports = {
    contentInserter
};