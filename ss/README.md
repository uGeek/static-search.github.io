# SS - Static Search

Static Search is an easy to use jQuery plugin, Bootstrap styled, that acts as a search engine in the client-side. Made for static sites.

You can see how it works in our [demo](https://static-search.github.io). See the source code.

## Installation

Copy the `ss` folder to the desired location on your site. For example, within `/assets/js/`.

Once this is done, you will need a form to search and an HTML block to show the results:

```html
<form>
    <input type="text" name="ss" id="ss_input">
    <button type="submit">Search</button>
</form>

<div id="ss_content"></div>
```

The field ID can be anything. The `name` attribute is required for searches to be interpreted by the URL, it can also contain any value.

The result block ID is `ss_content` by default, but can be customized as long as you indicate this at plugin startup.

It is necessary to have the jQuery library and the main SS file in order to initialize the plugin:

```html
<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src="/assets/js/ss/ss.min.js"></script>
```

Having these two files, simply initialize the plugin according to the selector used in the form's search field:

```html
<script>
    $('#ss_input').ss();
</script>
```

And it's ready! Your search system should already work showing the sample results contained in the `content.json` file.

## Customizable Options to Initialize the SS

There are several options you can use to better tailor the SS to your site.

Below is an example with all options being commented:

```html
<script>
    $('#ss_input').ss({
        /// Content file location
        'contentLocation': 'ss/content.json',
        // Configuration file location
        'configLocation': 'ss/config.js',
        // SS language
        'lang': 'en',
        // The HTML block ID where results will be shown
        'contentId': 'ss_content',
        // Amount of seconds the SS should not re-download configuration, language, and content files
        'cacheSeconds': 7200,
        // TODO
        'contextBuffer': 60,
        // TODO
        'contextLength': 60,
        // TODO
        'contextStart': 90,
        // Enables debug mode, showing the score of searches and messages in the browser console
        'debug': false,
        // Maximum number of words to be shown in the descriptive text of each item of results
        'descriptiveWords': 25,
        // It makes the search word becomes bold in the text description of each item of the results
        'highlightTerms': true,
        // Minimum number of characters accepted in search
        'minimumLength': 3,
        // The results links should open in a new window
        'newWindow': false,
        // Number of items shown on each result page
        'show': 10,
        // TODO
        'showContext': true,
        // Shows the related searches defined in the config.js file
        'showRelated': true,
        // It shows the time that the SS took to do the research
        'showTime': true,
        // Shows the amount of results found in the search
        'showTitleCount': true,
        // Shows the URL of each result item
        'showURL': true,
        // Only exact words are valid for results
        'wholeWords': true
    });
</script>
```

## Generate the Search Index

Because the search is performed 100% in the user's browser, the SS requires that the results index be accessible in a pre-defined file.

The index works like a database containing all the pages to search.

It is a JSON file and its name is `content.json`.

We have created two ways to index the required pages, one using Jekyll and one quoting the URL's of the pages through a crawler in PHP.

You do not need to have Jekyll or the PHP interpreter on your server for the SS to work, but in your development environment one of them will make it easier for you.

### Jekyll

The easiest way to generate `content.json` is to use Jekyll. The SS has already been designed to work with it, but works on any static site.

Inside the SS folder you will find the `jekyll_content.json` file and opening it will see at the top the `ss/content.json` permalink. You must adapt this value according to the structure of your site.

For example, if the location of the SS on your site is in `/assets/js/ss/`. Then you should set the permalink to `/assets/js/ss/content.json`. This will cause Jekyll to automatically create the index in the same directory as the SS.

#### Including pages and collections

By default, only posts are included in the search index. Pages and collections are not included.

Add the following to `_config.yml` to include pages and collections. `collections` is an array containing a list of collections you want to include.

```yml
ss:
  include:
    pages: true
    collections: [javascript, php]
```

#### Excluding from search index

Exclude single documents from the search index with a front-matter variable:

```yml
ss_exclude: true
```

Exclude multiple files, tags or categories using a setting in `_config.yml`. `files` is an array containing a list of file paths to be excluded. `tags` and `categories` are arrays containing lists of tags and categories you want to exclude.

```yml
ss:
  exclude:
    files: [search.html, _javascript/localStorage.md, _php/DOMDocument.md]
    tags: [tag1, tag2]
    categories: [category1, category2]
```

### PHP

Calm. As already said, you do not need to have PHP on your server. But if you do not use Jekyll you should create the `content.json` file somehow and then we already made available two PHP files inside the SS folder.

The `urls.php` file is where you will add the URLs you want to have in the index.

The `set_content.php` file is the crawler that will scan each URL page, capture the required data and create the` content.json` file.

After adding the URL's, the most practical way to run the crawler is through the terminal.

Go to the same directory as the `set_content.php` file and run:

```sh
php set_content.php
```

Wait for the process to finish and verify that the index has been created.

If you have PHP on your server, you can access the `set_content.php` file directly from the URL of your site. But a Token to prevent abuse should be entered in the URL via Query Parameter.

Access through the browser should look something like this:

```
http://domain.tld/assets/js/ss/set_content.php?token=ss
```

Note that the default Token is `ss`. If you want to change this, open the file `set_content.php` and in the beginning you will find the variable `$token`. Just add a new value to it and save the file. For example:

```php
$token = 'asfjiuf4u7i4hyr';
```

Then your URL will be:

```
http://domain.tld/assets/js/ss/set_content.php?token=asfjiuf4u7i4hyr
```

## Contribution

We accept and like receiving contributions from the Open Source community.

If you have documented, minified, translated into your language, or made any improvements that you think are relevant to the community, do not hesitate to open an [issue](https://github.com/static-search/ss/issues) and send us your Pull Request.

Report all bugs.
