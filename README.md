# wikijs-cli

A Wiki.js updater

## Install

```
yarn install
```

## Usage

### enviroment

Create a new `.env` file:

```
cp .env-example .env
```

and fill out our Wiki.js instance address and access token.

### wikijs-cli.js

#### list-page-field

List all editable properties of a Page object.

```
./bin/wikijs-cli.js list-page-fields
```

#### list-page

List all pages available on the Wiki.js host.

```
./bin/wikijs-cli.js list-pages
```

#### get-page

Retrieve properties of a Page object using its `id` field. 

```
./bin/wikijs-cli.js get-page 1
```

Retrieve only the text content:

```
./bin/wikijs-cli.js get-page --text 1
```

#### update-page

Update a Page object based on its `id` field.

```
./bin/wikijs-cli.js update-page 2 data.json
```

Update only the text content of a page.

```
./bin/wikijs-cli.js update-page 2 --text content.txt
```

### content-inserter-cli.js

Insert new content into a downloaded Wiki.js page. By default the update will be appended to the content marked by `{tagname}...{/tagname}` where `tagname` can be set on the command line or read from the `CONTENT_TAG` environment variable.

```
./bin/content-inserver-cli.js old_content.txt update.txt > new_content.txt
```

Optionally provide a minimum similarity score before new data is appended to the text

```
./bin/content-inserver-cli.js --similarity 0.9 old_content.txt update.txt > new_content.txt
```

Optionally overwrite existing tag sections

```
./bin/content-inserver-cli.js --overwrite old_content.txt update.txt > new_content.txt
```