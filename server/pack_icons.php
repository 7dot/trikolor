<?php
$plugin_dir = '../plugins/';
$plugin_file = $plugin_dir.'plugins.js';
$plugin_file_raw = $plugin_dir.'plugins.raw.js';
$sprite_file = '../sprite.png';
$css_file = '../icons.css';

$config = file_get_contents(file_exists($plugin_file_raw)? $plugin_file_raw : $plugin_file);

$tempar = explode("\n",$config);
$tempar = array_slice($tempar, 1, -1);

$len = count($tempar);

$im = imagecreatetruecolor( 16*$len, 16);
$background = imagecolorallocatealpha($im, 255, 255, 255, 127);
imagefill($im, 0, 0, $background);
imageAlphaBlending($im, false);
imageSaveAlpha($im, true);

$css_content = ".sprite-icon { width: 16px; height: 16px; background-image: url(".str_replace('../','',$sprite_file).") !important; }";

foreach($tempar as $i=>$value){ $path = str_replace(array(',','"'),'',trim($value)); $icon = '../plugins/'.$path.'/icon.png'; $icon_im = imagecreatefrompng($icon);
 $x = 16*$i;
 imagecopy($im, $icon_im, $x, 0, 0, 0, 16, 16);
 imagedestroy($icon_im);
 $css_content.="\r\n".".sprite-icon-".str_replace('/','-',$path)." { background-position: -".$x."px 0; }";
}

imagepng($im, $sprite_file);
imagedestroy($im);

file_put_contents($css_file,$css_content);

print('Done<br><br><img src="'.$sprite_file.'">');