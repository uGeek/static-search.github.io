<?php
/**
 * @author   Natan Felles <natanfelles@gmail.com>
 */

// Custom access token
$token = 'ss';

// Custom JSON output
$json_pretty_print = false;

if (php_sapi_name() != 'cli') {
    if (!isset($_GET['token']) || $_GET['token'] != $token) {
        exit('Invalid token.');
    }
}

include 'urls.php';

$urls = isset($urls) ? $urls : [];

/**
 * Dump and die
 *
 * @param  mixed $var
 */
function dd($var)
{
    var_dump($var);
    exit;
}

/**
 * Sanitize output string
 *
 * @param  string $str
 * @return string
 */
function sanitize($str)
{
    $str = str_replace("\t", ' ',
        str_replace("\r", ' ',
            str_replace("\n", ' ',
                strip_tags($str)
            )
        )
    );

    $lines = explode(' ', $str);
    $san = [];
    foreach ($lines as $line) {
        if (trim($line) != '') {
            $san[] = $line;
        }
    }

    return implode(' ', $san);
}

$content = [];

foreach ($urls as $url) {

    $doc = new DOMDocument(5, 'utf-8');

    // Remove redundant whitespace
    $doc->preserveWhiteSpace = false;

    // Turning off some errors
    libxml_use_internal_errors(true);

    if ($source = file_get_contents($url)) {
        // Loads the content without adding enclosing html/body tags and also the doctype declaration
        $doc->loadHTML(
            mb_convert_encoding($source, 'HTML-ENTITIES', 'UTF-8'),
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
    } else {
        // Error. Stop item here.
        continue;
    }

    // Title --------------------------------------------------------------
    $title = '';
    if ($title = $doc->getElementsByTagName('title')->item(0)) {
        $title = sanitize($title->nodeValue);
    }
    //dd($title);

    // Text ---------------------------------------------------------------

    //* Headers - h1, h2, h3, h4, h5, h6
    /*$h = [1 => [], 2 => [], 3 => [], 4 => [], 5 => [], 6 => []];
    foreach ($h as $k => $v) {
        for ($i = 0; $i < $doc->getElementsByTagName('h' . $k)->length; $i++) {
            $h[$k][$i] = sanitize($doc->getElementsByTagName('h' . $k)->item($i)->nodeValue);
        }
        $h[$k] = array_unique($h[$k]);
    }*/
    //dd($h);

    //* Paragraphs - p
    /*$p = [];
    for ($i = 0; $i < $doc->getElementsByTagName('p')->length; $i++) {
        $p[$i] = sanitize($doc->getElementsByTagName('p')->item($i)->nodeValue);
    }
    $p = array_unique($p);*/
    // dd($p);

    //* Body
    $body = '';
    if ($body = $doc->getElementsByTagName('body')->item(0)) {
        $body = sanitize($body->nodeValue);
    }
    // dd($body);


    // Tags ---------------------------------------------------------------
    $keywords = '';
    $meta = $doc->getElementsByTagName('meta');
    for ($i = 0; $i < $meta->length; $i++) {
        if ($meta->item($i)->getAttribute('name') == 'keywords') {
            $keywords = $meta->item($i)->getAttribute('content');
            $keywords = explode(',', $keywords);
            for ($i = 0; $i < count($keywords); $i++) {
                $keywords[$i] = sanitize($keywords[$i]);
            }
            $keywords = implode(', ', $keywords);
            break;
        }
    }
    //dd($keywords);

    // Set content --------------------------------------------------------
    $content[] = [
        'title' => (string)$title,
        'text' => (string)$body,
        'tags' => (string)$keywords,
        'url' => (string)$url,
    ];
}
//dd($content);

$filename = __DIR__ . '/content.json';

if (file_put_contents($filename, json_encode($content, ($json_pretty_print ? JSON_PRETTY_PRINT : false)))) {
    echo 'Success! Content updated. File size: ' . ($fs = round(filesize($filename) / 1024, 2)) . ' KB.';

    if ($fs > 5000) {
        echo '<br>Warning!!! Browser local storage maximum support can be 5 MB.';
    }
} else {
    echo 'File could not be saved.';
}

echo PHP_EOL;
