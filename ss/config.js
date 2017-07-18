/**
 * SS Config
 * @type {{related: {searches: [*]}, replace: {words: [*]}, stem: {words: [*]}, weight: {weight: [*]}}}
 */
var config = {
    // Related searches
    related: {
        'searches': [
            {
                'search': 'js',
                'related': 'jquery'
            },
            {
                'search': 'ajax',
                'before': 'jquery',
                'related': 'javascript'
            },
            {
                'search': 'ci',
                'before': 'codeigniter',
                'related': 'php'
            },
            {
                'search': 'linux',
                'after': 'gnu',
                'related': 'debian'
            },
            {
                'search': 'linux',
                'after': 'gnu',
                'related': 'centos'
            },
            {
                'search': 'debian',
                'after': 'linux',
                'related': 'centos'
            }
        ]
    },
    // Words to replace
    replace: {
        'words': [
            {
                'word': 'deban',
                'replace_with': 'debian'
            },
            {
                'word': 'javscript',
                'replace_with': 'javascript'
            },
            {
                'word': 'jqeury',
                'replace_with': 'jquery'
            }
        ]
    },
    // Illogical stemming
    stem: {
        'words': [
            {
                'word': 'e-mail',
                'stem': 'email'
            },
            {
                'word': 'javascript',
                'stem': 'jquery'
            },
            {
                'word': 'javascript',
                'stem': 'js'
            },
            {
                'word': 'gnu/linux',
                'stem': 'linux'
            }
        ]
    },
    // Weighting
    weight: {
        'weight': [
            {
                'url': 'https://en.wikipedia.org/wiki/Linux',
                'score': 30
            },
            {
                'url': 'https://en.wikipedia.org/wiki/C_(programming_language)',
                'score': 40
            },
            {
                'url': 'https://en.wikipedia.org/wiki/GNU_General_Public_License',
                'score': 50
            }
        ]
    }
};
