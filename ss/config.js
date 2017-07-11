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
                'search': 'debian',
                'after': 'linux',
                'related': 'kali'
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
                'url': 'https://api.jquery.com',
                'score': 20
            },
            {
                'url': 'https://www.w3schools.com',
                'score': 30
            },
            {
                'url': 'https://www.debian.org',
                'score': 50
            }
        ]
    }
};
