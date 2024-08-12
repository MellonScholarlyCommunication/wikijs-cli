const { stringSimilarity } = require("string-similarity-js");

const log4js = require('log4js');
const logger = log4js.getLogger();

async function contentInserter(content1,content2,options) {
    let tagSection = parseTextForTag(content1,options.tag);

    let isSeen = false;

    if (options.overwrite) {
        tagSection = [content2];
    }
    else if (options.similarity) {
        logger.debug(`processing similarity scores ${options.similarity}`);

        let max_score = 0;

        for (let i = 0 ; i < tagSection.length ; i++) {
            const old = tagSection[i];
            let score = stringSimilarity(old,content2);

            logger.debug(`Old: ${old}`);
            logger.debug(`New: ${content2}`);
            logger.debug(`Similariry: ${score}`);

            if (score > max_score) {
                logger.debug(`max_score set to ${score} by ${old}`);
                max_score = score;
            }
        }

        logger.debug(`max_score = ${max_score}`);

        if (max_score < options.similarity) {
            logger.info(`Max Score (${max_score}): ignoring ${content2}`);
            isSeen = true;
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