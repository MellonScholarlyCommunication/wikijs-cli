const { createClient } = require('graphqurl');
const log4js = require('log4js');

const logger = log4js.getLogger();

async function updatePage(id,version,options) {
    try {
        logger.info(`get previous version of ${id}`);
        const prevVersion = await getPage(id,options);

        if (! prevVersion) {
            logger.error(`no version found`);
            return null;
        }

        const newVersion = {...prevVersion, ...version};

        const tstQ = `
mutation ($id: Int!, $content: String , $isPrivate: Boolean, $isPublished: Boolean, $tags: [String]) {
	  pages {
	    update(
	      id: $id ,
          content: $content,
          isPrivate: $isPrivate,
          isPublished: $isPublished,
          tags: $tags
	    ) {
	      responseResult {
	        errorCode,
            message,
	        succeeded,
	        slug
	      }
	    }
	  }
	}
`;

        const result = await gqlQuery({
            query: tstQ,
            variables: {
                id: parseInt(id),
                content: newVersion.content,
                isPrivate: newVersion.isPrivate,
                isPublished: newVersion.isPublished,
                tags: newVersion.tags
            }
        }, options);
    
        if (result) {
            return result.data.pages.update.responseResult;
        }
    
        return null;
    }
    catch (e) {
        logger.error(e);
        return null;
    }
}

async function listPages(options) {
    const tstQ = `
{
    pages {
        list (orderBy: ID) {
            id
            path
            title
            isPrivate
            isPublished
            updatedAt
            createdAt
        }
    }
}
`;
    
    try {
        const result = await gqlQuery({
            query: tstQ
        }, options);
    
        if (result) {
            return result.data.pages.list;
        }

        return null;
    }
    catch (e) {
        logger.error(e);
    }
}

async function getPage(id,options) {
    const tstQ = `
{
  pages {
    single (id: ${id}) {
        id
        hash
        path
        title
        tags {
          tag
        }
        description
        content
        isPrivate
        isPublished
        updatedAt
        createdAt
    }
  }
}
    `;

    try {
        const result = await gqlQuery({
            query: tstQ
        }, options);

        if (result) {
            const data = result['data']['pages']['single'];
            data.tags  = data.tags.map( (t) => t.tag );
            return data;
        }

        return null;
    }
    catch (e) {
        logger.error(e);
    }
}

async function listPageFields(options) {
    const tstQ = `
{
  __type(name:"Page") {
    fields {
        name
    }
  }
}
    `;

    try {
        const result = await gqlQuery({
            query: tstQ
        }, options);

        if (result) {
            const fields = result['data']['__type']['fields'].map( (e) => {
                return e.name
            });
            return fields;
        }
    }
    catch (e) {
        logger.error(e);
    }
}

async function gqlQuery(query, options) {
    logger.debug(JSON.stringify(query));
    const client = createClient({
        endpoint: options['url'],
        headers: {
            'Authorization': `Bearer ${options.token}`
        }
    });

    return new Promise( (resolve,reject) => {
        client.query( 
            query ,
            ( response, queryType, parsedQuery) => {
                resolve(response);
            },
            (error, queryType, parsedQuery) => {
                reject(error);
            }
        );
    });
}

module.exports = {
    listPages,
    getPage,
    updatePage ,
    listPageFields ,
    gqlQuery
};