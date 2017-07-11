<?php
/**
 * @author   Natan Felles <natanfelles@gmail.com>
 */

/**
 * @var array $urls URL's list
 */
include 'urls.php';

// Custom access token
$token = 'ss';

if ($_GET['token'] != $token) {
    exit('Invalid token.');
}

$content = [];

foreach ($urls as $url) {
    try {
        $document = new DOMDocument();

        if ($contents = file_get_contents($url)) {
            $document->loadHTML($contents);
        } else {
            // Error. Stop item here.
            $content[] = [
                'title' => '',
                'text' => '',
                'tags' => '',
                'url' => $url,
            ];
            continue;
        }

        // Title --------------------------------------------------------------
        $title = $document->getElementsByTagName('title')->item(0)->nodeValue;

        // Text ---------------------------------------------------------------
        $text_parts = explode(' ', str_replace(PHP_EOL, ' ',
            str_replace("\t", ' ',
                strip_tags($document->getElementsByTagName('body')->item(0)->nodeValue)
            )
        ));

        for ($i = 0; $i < count($text_parts); $i++) {
            if (trim($text_parts[$i]) == '') {
                continue;
            }
            $tp[] = $text_parts[$i];
        }

        $text = implode(' ', isset($tp) ? $tp : []);

        // Tags ---------------------------------------------------------------
        $tags = '';
        $meta = $document->getElementsByTagName('meta');
        for ($i = 0; $i < $meta->length; $i++) {
            if ($meta->item($i)->getAttribute('name') == 'keywords') {
                $tags = $meta->item($i)->getAttribute('content');
                $tags = explode(',', $tags);
                for ($i = 0; $i < count($tags); $i++) {
                    $tags[$i] = trim($tags[$i]);
                }
                $tags = implode(' ', $tags);
                break;
            }
        }

        // Set content --------------------------------------------------------
        $content[] = [
            'title' => $title,
            'text' => $text,
            'tags' => $tags,
            'url' => $url,
        ];

    } catch (Exception $e) {
        echo $e->getMessage();
    }
}

try {
    file_put_contents('content.json', json_encode($content));
    echo 'Success! Content updated. File size: ' . $fs = round(filesize('content.json') / 1024, 2) . ' KB.';
    if ($fs > 5000) {
        echo '<br>Warning!!! Browser local storage maximum support can be 5 MB.';
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
