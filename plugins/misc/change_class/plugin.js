{
  "name"       : "Change image label",
  "options"    : {},
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   image.data('class', class_out);
                   callback();
                 }
}