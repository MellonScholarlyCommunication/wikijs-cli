const { stringSimilarity } = require("string-similarity-js");

const log4js = require('log4js');
const logger = log4js.getLogger();

async function contentInserter(content1,content2,options) {
    let updateContent = content2.replace(/(\r\n|\n|\r)/gm,"");

    let tagSection = parseTextForTag(content1,options.tag);

    let isSeen = false;

    if (options.overwrite || tagSection.length == 0) {
        tagSection = [updateContent];
    }
    else if (options.similarity) {
        logger.debug(`processing similarity scores ${options.similarity}`);

        let max_score = 0;

        for (let i = 0 ; i < tagSection.length ; i++) {
            const old = tagSection[i];
            let score = stringSimilarity(old,updateContent);

            logger.debug(`Old: ${old}`);
            logger.debug(`New: ${updateContent}`);
            logger.debug(`Similariry: ${score}`);

            if (score > max_score) {
                logger.debug(`max_score set to ${score} by ${old}`);
                max_score = score;
            }
        }

        logger.debug(`max_score = ${max_score}`);

        if (max_score < options.similarity) {
            logger.info(`Max Score (${max_score}): ignoring ${updateContent}`);
            isSeen = true;
        }

        if (! isSeen) {
            tagSection.push(updateContent);
        }
    }
    else {
        tagSection.push(updateContent);
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
            result.push('');
            for (let j = 0 ; j < section.length ; j++) {
                if (j>0) {
                    result.push('');
                }
                result.push(section[j]);
            }
            result.push('');
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