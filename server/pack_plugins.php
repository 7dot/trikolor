<?php

$plugin_dir = '../plugins/';
$plugin_file = $plugin_dir.'plugins.js';
$plugin_file_raw = $plugin_dir.'plugins.raw.js';

if(file_exists($plugin_file_raw)){
  if(isset($_GET['delete'])){
    unlink($plugin_file);
    copy($plugin_file_raw, $plugin_file);
    unlink($plugin_file_raw);
  }else{

    print('A packed file is exist
           <br> <a href="?delete">Delete old file and repack</a>');
    exit;
  }
}
copy($plugin_file, $plugin_file_raw);
$tempar = explode("\n",file_get_contents($plugin_file));
$first_line = trim($tempar[0]);
$end_line = trim($tempar[count($tempar)-1]);
$tempar = array_slice($tempar, 1, -1);
foreach($tempar as $key=>$value){  $path = str_replace(array(',','"'),'',trim($value));
  $plugin = file_get_contents($plugin_dir.$path.'/plugin.js');
  $plugin = '{ "path" : "'.$path.'",'.substr($plugin,1);
  $tempar[$key] = $plugin;
}

file_put_contents($plugin_file, $first_line.implode(',', $tempar).$end_line);
print('Done');