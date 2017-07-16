/*!
 * SS - Static Search v0.0.2
 * https://static-search.github.io/
 *
 * Created by Natan Felles
 * https://natanfelles.github.io
 *
 * Initially based on Tipue Search 6.1
 * http://www.tipue.com/search
 *
 * Released under the MIT license
 *
 * Date: 2017-07-11T10:11Z
 */

(function ($) {

    $.fn.ss = function (options) {

		/**
		 * SS Full URL path location. Ex: http://domain.tld/ss/
		 * @type {string}
		 */
		var SSLocation = '';
		$('script').each(function (k, v) {
			if (v.src.indexOf('ss.min.js') !== -1) {
				SSLocation = v.src.replace('ss.min.js', '');
			}
			else if (v.src.indexOf('ss.js') !== -1) {
				SSLocation = v.src.replace('ss.js', '');
			}
		});

		//console.log(SSLocation);

        var set = $.extend({
            'contentLocation': SSLocation + 'content.json',
            'configLocation': SSLocation + 'config.js',
            'lang': 'en',
            'contentId': 'ss_content',
            'cacheSeconds': 7200, // 2 hours
            'contextBuffer': 60,
            'contextLength': 60,
            'contextStart': 90,
            'debug': false,
            'descriptiveWords': 25,
            'highlightTerms': true,
            'minimumLength': 3,
            'newWindow': false,
            'show': 10,
            'showContext': true,
            'showRelated': true,
            'showTime': true,
            'showTitleCount': true,
            'showURL': true,
            'wholeWords': true
        }, options);

        var ss = {
            input: this, // Input field
            pages: [], // Content pages
            lang: {}, // Language
            config: {} // Config
        };

        return this.each(function () {

            $.ajax({
                cache: false
            });

            var ss_t_c = 0;

            $('#' + set.contentId).html('<h1 class="text-center text-muted"><i class="glyphicon glyphicon-search"></i></h1>');

            var time = {};
            time.start = new Date().getTime();
            time.expires = time.start + 1000 * set.cacheSeconds;

            // Get content pages
            if (!localStorage.getItem('ss.pages') || !localStorage.getItem('ss.lang') || !localStorage.getItem('ss.config') || localStorage.getItem('ss.expires') <= time.start) {

                if (set.debug === true) {
                    console.log('SS: Getting new data...');
                }

                $.when(
                    $.getJSON(set.contentLocation)
                        .fail(function () {
                            console.log('SS: Content file "' + set.contentLocation + '" could not be get.');
                        }),
                    $.getJSON(SSLocation + '/lang/' + set.lang + '.json')
                        .fail(function () {
                            console.log('SS: Language file "' + set.lang + '" could not be get.');
                        }),
                    $.getScript(set.configLocation)
                        .fail(function () {
                            console.log('SS: Config file "' + set.configLocation + '" could not be get.');
                        })
                ).done(function (p, l, c) {
                    if (set.debug === true) {
                        console.log('SS: Done.');
                    }

                    // Set time.expires
                    localStorage.setItem('ss.expires', time.expires);

                    // Set the pages
                    ss.pages = p[0];
                    localStorage.setItem('ss.pages', JSON.stringify(ss.pages));

                    // Set the languages
                    ss.lang = l[0];
                    localStorage.setItem('ss.lang', JSON.stringify(ss.lang));

                    // Set config
                    ss.config = config;
                    localStorage.setItem('ss.config', JSON.stringify(config));

                    // Execute the search
                    exec();
                });
            } else {

                if (set.debug === true) {
                    console.log('SS: Getting cached data...');
                }

                ss.pages = $.parseJSON(localStorage.getItem('ss.pages'));
                ss.lang = $.parseJSON(localStorage.getItem('ss.lang'));
                ss.config = $.parseJSON(localStorage.getItem('ss.config'));

                if (set.debug === true) {
                    console.log('SS: Done.');
                }

                // Execute the search
                exec();
            }


            /**
             * Link target
             * @type {string}
             */
            var a_target = set.newWindow ? ' target="_blank"' : '';

            function getURLP(name) {
                var _locSearch = location.search;
                var _splitted = (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(_locSearch) || [, ""]);
                var searchString = _splitted[1].replace(/\+/g, '%20');
                try {
                    searchString = decodeURIComponent(searchString);
                } catch (e) {
                    searchString = unescape(searchString);
                }
                return searchString || null;
            }

            /**
             *
             * @param {int} start Initial item from search list
             * @param {boolean} replace True to replace words
             */
            function getSS(start, replace) {
                /**
                 * HTML output
                 * @type {string}
                 */
                var out = '';

                /**
                 * Show message that a word is replaced
                 * @type {boolean}
                 */
                var show_replace = false;

                /**
                 * Show message that stop words are ignored
                 * @type {boolean}
                 */
                var show_stop = false;

                var standard = true;
                var c = 0;

                /**
                 * Results found
                 * @type {Array}
                 */
                var found = [];

                /**
                 * Searched value
                 * @type {string}
                 */
                var d_o = $(ss.input).val();

                /**
                 * Searched value in lowercase
                 * @type {string}
                 */
                var d = d_o.toLowerCase();

                // Trim the searched value
                d = $.trim(d);

                if ((d.match("^\"") && d.match("\"$")) || (d.match("^'") && d.match("'$"))) {
                    standard = false;
                }

                /**
                 * Searched words
                 * @type {Array}
                 */
                var d_w = d.split(' ');

                if (standard) {

                    /**
                     * Valid words separed by spaces
                     * @type {string}
                     */
                    d = '';

                    for (i = 0; i < d_w.length; i++) {

                        /**
                         * Add word to valid searched words
                         * @type {boolean}
                         */
                        var a_w = true;

                        for (f = 0; f < ss.lang['sw'].length; f++) {
                            //console.log(ss.lang['sw'][f]);
                            // Check if word exists in the stop word list
                            if (d_w[i] === ss.lang['sw'][f]) {
                                // Do not add this word
                                a_w = false;
                                // We need show that stop words are ignored
                                show_stop = true;
                            }
                        }

                        if (a_w) {
                            // Add word to the valid words
                            d = d + ' ' + d_w[i];
                        }
                    }

                    // Trim the valid words string
                    d = $.trim(d);

                    /**
                     * Valid searched words
                     * @type {Array}
                     */
                    d_w = d.split(' ');
                } else {
                    d = d.substring(1, d.length - 1);
                }

                var score, i, f = 0;
                if (d.length >= set.minimumLength) {
                    if (standard) {

                        if (replace) {
                            var d_r = d;
                            for (i = 0; i < d_w.length; i++) {
                                for (f = 0; f < ss.config.replace.words.length; f++) {
                                    if (d_w[i] === ss.config.replace.words[f].word) {
                                        d = d.replace(d_w[i], ss.config.replace.words[f].replace_with);
                                        show_replace = true;
                                    }
                                }
                            }
                            d_w = d.split(' ');
                        }

                        var d_t = d;

                        for (i = 0; i < d_w.length; i++) {
                            for (f = 0; f < ss.config.stem.words.length; f++) {
                                if (d_w[i] === ss.config.stem.words[f].word) {
                                    d_t = d_t + ' ' + ss.config.stem.words[f].stem;
                                }
                            }
                        }

                        d_w = d_t.split(' ');


                        /**
                         * Page text
                         * @type {string}
                         */
                        var s_t = '';

                        for (i = 0; i < ss.pages.length; i++) {
                            score = 0;
                            s_t = ss.pages[i].text;

                            for (f = 0; f < d_w.length; f++) {
                                if (set.wholeWords) {
                                    var pat = new RegExp('\\b' + d_w[f] + '\\b', 'gi');
                                } else {
                                    var pat = new RegExp(d_w[f], 'gi');
                                }
                                if (ss.pages[i].title.search(pat) != -1) {
                                    var m_c = ss.pages[i].title.match(pat).length;
                                    score += (20 * m_c);
                                }
                                if (ss.pages[i].text.search(pat) != -1) {
                                    var m_c = ss.pages[i].text.match(pat).length;
                                    score += (20 * m_c);
                                }

                                if (ss.pages[i].tags.search(pat) != -1) {
                                    var m_c = ss.pages[i].tags.match(pat).length;
                                    score += (10 * m_c);
                                }

                                if (ss.pages[i].url.search(pat) != -1) {
                                    score += 20;
                                }

                                if (score !== 0) {
                                    for (var e = 0; e < ss.config.weight.weight.length; e++) {
                                        if (ss.pages[i].url == ss.config.weight.weight[e].url) {
                                            score += ss.config.weight.weight[e].score;
                                        }
                                    }
                                }

                                if (d_w[f].match('^-')) {
                                    pat = new RegExp(d_w[f].substring(1), 'i');
                                    if (ss.pages[i].title.search(pat) != -1 || ss.pages[i].text.search(pat) != -1 || ss.pages[i].tags.search(pat) != -1) {
                                        score = 0;
                                    }
                                }
                            }

                            if (score !== 0) {
                                found.push({
                                    "score": score,
                                    "title": ss.pages[i].title,
                                    "desc": s_t,
                                    "url": ss.pages[i].url
                                });
                                c++;
                            }
                        }
                    } else {
                        for (i = 0; i < ss.pages.length; i++) {
                            score = 0;
                            s_t = ss.pages[i].text;
                            var pat = new RegExp(d, 'gi');
                            if (ss.pages[i].title.search(pat) != -1) {
                                var m_c = ss.pages[i].title.match(pat).length;
                                score += (20 * m_c);
                            }
                            if (ss.pages[i].text.search(pat) != -1) {
                                var m_c = ss.pages[i].text.match(pat).length;
                                score += (20 * m_c);
                            }

                            if (ss.pages[i].tags.search(pat) != -1) {
                                var m_c = ss.pages[i].tags.match(pat).length;
                                score += (10 * m_c);
                            }

                            if (ss.pages[i].url.search(pat) != -1) {
                                score += 20;
                            }

                            if (score !== 0) {
                                for (var e = 0; e < ss.config.weight.weight.length; e++) {
                                    console.log(ss.pages[i].url);
                                    console.log(ss.config.weight.weight[e].url);
                                    if (ss.pages[i].url == ss.config.weight.weight[e].url) {
                                        score += ss.config.weight.weight[e].score;
                                    }
                                }
                            }

                            if (score != 0) {
                                found.push({
                                    "score": score,
                                    "title": ss.pages[i].title,
                                    "desc": s_t,
                                    "url": ss.pages[i].url
                                });
                                c++;
                            }
                        }
                    }

                    if (c != 0) {
                        if (set.showTitleCount && ss_t_c == 0) {
                            var title = document.title;
                            document.title = '(' + c + ') ' + title;
                            ss_t_c++;
                        }

                        if (show_replace) {
                            out += '<div class="alert alert-info">' + ss.lang[1] + ' <em>' + d + '</em>. ' + ss.lang[2] + ' <a id="ss_replaced" class="alert-link">' + d_r + '</a></div>';
                        }
                        if (c == 1) {
                            out += '<div class="text-muted text-right">' + ss.lang[3];
                        } else {
                            var c_c = c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            out += '<div class="text-muted text-right">' + c_c + ' ' + ss.lang[4];
                        }
                        if (set.showTime) {
                            time.end = new Date().getTime();
                            time.diff = (time.end - time.start) / 1000;
                            out += ' (' + time.diff.toFixed(2) + ' ' + ss.lang[13] + ')';
                            set.showTime = false;
                        }
                        out += '</div>';

                        // Sort found results by score
                        found.sort(function (a, b) {
                            return b.score - a.score
                        });

                        // Start list group
                        out += '<div class="list-group">';

                        /**
                         * List order
                         * @type {number}
                         */
                        var l_o = 0;

                        for (i = 0; i < found.length; i++) {
                            if (l_o >= start && l_o < set.show + start) {
                                // Start new item
                                out += '<a href="' + found[i].url + '" class="list-group-item"' + a_target + '>' +
                                    // Item title
                                    '<h4 class="list-group-item-heading">' + found[i].title + '</h4>';


                                if (set.debug) {
                                    // Item score
                                    out += '<span class="text-danger">' + ss.lang[15] + ': ' + found[i].score + '</span>';
                                }

                                if (set.showURL) {
                                    var s_u = found[i].url.toLowerCase();
                                    if (s_u.indexOf('http://') === 0) {
                                        s_u = s_u.slice(7);
                                    }
                                    // Item URL
                                    out += '<div class="text-muted">' + s_u + '</div>';
                                }

                                if (found[i].desc) {
                                    var t = found[i].desc;

                                    if (set.showContext) {
                                        d_w = d.split(' ');
                                        var s_1 = found[i].desc.toLowerCase().indexOf(d_w[0]);
                                        if (s_1 > set.contextStart) {
                                            var t_1 = t.substr(s_1 - set.contextBuffer);
                                            var s_2 = t_1.indexOf(' ');
                                            t_1 = t.substr(s_1 - set.contextBuffer + s_2);
                                            t_1 = $.trim(t_1);

                                            if (t_1.length > set.contextLength) {
                                                t = '... ' + t_1;
                                            }
                                        }
                                    }

                                    if (standard) {
                                        d_w = d.split(' ');
                                        for (var f = 0; f < d_w.length; f++) {
                                            if (set.highlightTerms) {
                                                var patr = new RegExp('(' + d_w[f] + ')', 'gi');
                                                t = t.replace(patr, "<h0011>$1<h0012>");
                                            }
                                        }
                                    } else if (set.highlightTerms) {
                                        var patr = new RegExp('(' + d + ')', 'gi');
                                        t = t.replace(patr, "<strong>$1</strong>");
                                    }

                                    /**
                                     * Text description
                                     * @type {string}
                                     */
                                    var t_d = '';

                                    /**
                                     * Text words
                                     * @type {Array}
                                     */
                                    var t_w = t.split(' ');

                                    // Set text description to be showed
                                    if (t_w.length < set.descriptiveWords) {
                                        t_d = t;
                                    } else {
                                        for (f = 0; f < set.descriptiveWords; f++) {
                                            t_d += t_w[f] + ' ';
                                        }
                                    }

                                    // Trim the setted text description
                                    t_d = $.trim(t_d);

                                    // Add elipse if text do not ends with dot
                                    if (t_d.charAt(t_d.length - 1) !== '.') {
                                        t_d += ' ...';
                                    }

                                    // Mark searched words as strong in text description
                                    t_d = t_d.replace(/h0011/g, 'strong');
                                    t_d = t_d.replace(/h0012/g, '/strong');

                                    // Add text and ends the item
                                    out += '<p class="list-group-item-text">' + t_d + '</p></a>';
                                }
                            }
                            l_o++;
                        }
                        // Ends list group
                        out += '</div>';
                        //console.log(out);

                        if (set.showRelated && standard) {
                            f = 0;
                            for (i = 0; i < ss.config.related.searches.length; i++) {
                                if (d === ss.config.related.searches[i].search) {
                                    if (show_replace) {
                                        d_o = d;
                                    }
                                    if (!f) {
                                        // Start related items panel
                                        out += '<div class="panel panel-default">' +
                                            // Related items heading
                                            '<div class="panel-heading">' + ss.lang[14] + ' <strong>' + d_o + '</strong></div>' +
                                            // Start related items group
                                            '<div class="list-group">';
                                    }

                                    // Start related item
                                    out += '<a class="ss_related list-group-item" data-related="' +
                                        ss.config.related.searches[i].related +
                                        '">';

                                    // Add related item before
                                    if (ss.config.related.searches[i].before) {
                                        out += '<span class="label label-default">' +
                                            ss.config.related.searches[i].before +
                                            '</span> ';
                                    }

                                    // Add related item name
                                    out += ss.config.related.searches[i].related;

                                    // Add related item after
                                    if (ss.config.related.searches[i].after) {
                                        out += ' <span class="label label-default">' +
                                            ss.config.related.searches[i].after +
                                            '</span>';
                                    }

                                    // Ends related item
                                    out += '</a>';
                                    f++;
                                }
                            }
                            if (f) {
                                // Ends related items panel and list group
                                out += '</div></div>';
                            }
                        }

                        if (c > set.show) {

                            /**
                             * Total pages
                             * @type {number}
                             */
                            var tp = Math.ceil(c / set.show);

                            /**
                             * Current page
                             * @type {number}
                             */
                            var cp = (start / set.show);

                            out += '<nav class="text-center"><ul id="ss_pagination" class="pagination">';

                            if (start > 0) {
                                // Previous page
                                out += '<li><a accesskey="p" data-start="' + (start - set.show) + '" data-replace="' + replace + '">' + ss.lang[5] + '</a></li>';
                            }


                            if (cp <= 2) {
                                var p_b = 0;
                                p_b = tp;
                                if (tp > 3) {
                                    p_b = 3;
                                }
                                for (f = 0; f < p_b; f++) {
                                    if (f == cp) {
                                        out += '<li class="active"><span>' + (f + 1) + '</span></li>';
                                    } else {
                                        out += '<li><a data-start="' + (f * set.show) + '" data-replace="' + replace + '">' + (f + 1) + '</a></li>';
                                    }
                                }
                            } else {
                                var p_b = 0;
                                p_b = cp + 2;
                                if (p_b > tp) {
                                    p_b = tp;
                                }
                                for (f = cp - 1; f < p_b; f++) {
                                    if (f == cp) {
                                        out += '<li class="active"><span>' + (f + 1) + '</span></li>';
                                    } else {
                                        out += '<li><a data-start="' + (f * set.show) + '" data-replace="' + replace + '">' + (f + 1) + '</a></li>';
                                    }
                                }
                            }

                            if (cp + 1 !== tp) {
                                // Next page
                                out += '<li><a accesskey="n" data-start="' + (start + set.show) + '" data-replace="' + replace + '">' + ss.lang[6] + '</a></li>';
                            }

                            out += '</ul></nav>';
                        }
                    } else {
                        out += '<div  class="alert alert-danger">' + ss.lang[7] + '</div>';
                    }
                } else {
                    if (show_stop) {
                        out += '<div  class="alert alert-danger">' + ss.lang[7] + ' ' + ss.lang[8] + '</div>';
                    } else {
                        out += '<div  class="alert alert-danger"><strong>' + ss.lang[9] + '</strong><ul>';
                        if (set.minimumLength === 1) {
                            out += '<li>' + ss.lang[10] + '</li>';
                        } else {
                            out += '<li>' + ss.lang[11] + ' ' + set.minimumLength + ' ' + ss.lang[12] + '</li>';
                        }
                        out += '</ul></div>';
                    }
                }

                /**
                 * Set the output
                 */
                $('#' + set.contentId).html(out);

                /**
                 * Search without check replace words
                 */
                $('#ss_replaced').click(function () {
                    getSS(0, false);
                });

                /**
                 * Search related words
                 */
                $('.ss_related').click(function () {
                    $(ss.input).val($(this).data('related'));
                    getSS(0, true);
                });

                /**
                 * Search from pagination link click
                 */
                $('#ss_pagination').children('li').children('a').click(function () {
                    getSS($(this).data('start'), $(this).data('replace'));
                });
            }

            /**
             * Execute the search
             */
            function exec() {

                if (set.debug === true) {
                    console.log('SS: Object...');
                    console.log(ss);
                }

                if (getURLP($(ss.input).attr('name'))) {
                    $(ss.input).val(getURLP($(ss.input).attr('name')));
                    getSS(0, true);
                }

                $(this).keyup(function () {
                    if ($(ss.input).val().length >= set.minimumLength) {
                        getSS(0, true);
                    }
                });
            }

        });
    };

})(jQuery);
