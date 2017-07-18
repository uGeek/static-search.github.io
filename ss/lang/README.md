# Languages

Inside this folder you found the translated files of the Static Search.

The language files are in the JSON syntax and have numeric keys in the translated phrases and the *sw* key have an array of [Stop Words](http://www.ranks.nl/stopwords) of the corresponding language.

To translate the SS in your language we encourage the usage of the default `en.json` file as base.

Every language have your own stop words, and you must add it.

To call the SS in an existing language, you can do as follow:

```javascript
$('#ss_input').ss({
	'lang': 'pt-br' // Brazilian Portuguese
});
```

If you do a translation, please open a Pull Request to add it.
