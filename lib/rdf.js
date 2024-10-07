const { marked } = require("marked");
const rdfParser = require("rdf-parse").default;
const textStream = require('string-to-stream');
const N3 = require('n3');
const { parseTextForTag, updateTextWithTagSection} = require('../lib/inserter');

function upgradeMarkdown(markdown,tag) {
    const tagSection = parseTextForTag(markdown,tag);
    tagSection.unshift('<div vocab="http://schema.org/" typeof="ProfilePage">');
    tagSection.push('</div>');

    const newSection = [];

    for (let i = 0 ; i < tagSection.length ; i++) {
        let line = tagSection[i];

        if (line.match(/http(s)?:/) && !line.match(/<div vocab/)) {
            line = line.replace(/(http(s)?:[^ <]+)/g,`<span property="citation" src="$1">$1</span>`);    
        }

        newSection.push(line);
    }

    const newMarkdown = updateTextWithTagSection(markdown,tag,newSection);

    return newMarkdown;
}

async function toRDF(markdown,url,tag) {
    if (url === undefined) {
        url = 'http://generic.url.org';
    }
    if (tag === undefined) {
        tag = 'mastodon-bot';
    }
    markdown = upgradeMarkdown(markdown,tag);
    return new Promise( (resolve,reject) => {
        try {
            const writer = new N3.Writer();
            const html = marked(markdown);
          
            rdfParser.parse(textStream(html), { 
                contentType: 'text/html', baseIRI: url
            }).on('data', (quad) => writer.addQuad(quad))
            .on('error', (error) => reject(error))
            .on('end', () => {
                writer.end( (error, result) => {
                    resolve(result);
                });
            });
        }
        catch (e) {
            reject(e);
        }
    });
}

module.exports = { toRDF };