<?php
$f_ref = false;
if(!$f_ref && !empty($_SERVER['HTTP_REFERER'])){
  $ref_host = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST);
  if($ref_host == $_SERVER['HTTP_HOST'])
    $f_ref = true;
}

if($f_ref && isset($_GET['url'])){ $content=@file_get_contents(urldecode($_GET['url']));
 foreach($http_response_header as $value)
   if(
      stripos($value,'HTTP/')===0  ||
      stripos($value,'Content-Type:')===0  ||
      stripos($value,'Content-Length:')===0
   ) header($value);
 if($content) print($content);
}