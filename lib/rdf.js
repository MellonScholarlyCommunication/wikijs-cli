const { marked } = require("marked");
const rdfParser = require("rdf-parse").default;
const textStream = require('string-to-stream');
const N3 = require('n3');

async function toRDF(text) {
    return new Promise( (resolve,reject) => {
        try {
            const writer = new N3.Writer();
            const html = marked(text);
          
            rdfParser.parse(textStream(html), { 
                contentType: 'text/html', baseIRI: 'http://example.org'
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