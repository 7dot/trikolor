<?php

$img_dir='../images/';

switch($_GET['action']){

  case 'update': exit(json_encode(read_dir($img_dir)));

  case 'delete':
    if(is_file($img_dir.$_GET['img'])) unlink($img_dir.$_GET['img']);
    exit;

  case 'upload':
    $filename = "";
    $fileElementName = 'file';
    if(!empty($_FILES[$fileElementName]['tmp_name'])){
      $filename = 'image_'.get_name($img_dir).'.'.get_file_ext($_FILES[$fileElementName]['name']);
      move_uploaded_file($_FILES[$fileElementName]['tmp_name'],$img_dir.$filename);
    }
    exit('{"error":"","msg":"'.$filename.'"}');

}


// ============= functions ==============
function read_dir($path,$mode='file'){
  if(is_dir($path) && $dh=opendir($path)){
    	$func='is_'.$mode;
        $tempar=array();
        while(($file=readdir($dh))!==false)
          if($file!="." && $file!=".."  && $func($path.$file)) $tempar[]=$file;
        closedir($dh);
        return $tempar;
  }
  return array();
}

function get_name($img_dir){
  $n = 0;
  foreach(read_dir($img_dir) as $value){
    $temp = intval(str_replace('image_', '', $value));
    if($temp>$n) $n=$temp;
  }
  return ++$n;
}

function get_file_ext($filename){
  return substr(strrchr($filename,'.'),1);
}