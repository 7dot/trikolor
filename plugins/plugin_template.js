{
  "name"       : "Plugin name",
  "options"    : {},
  "load"       : [],
  "html"       : "",
  "init"       : function(element, options){ 
                  
                  // element.find('.filter-urls')
                  // var index = element.data('index');
                  // config.plugins[index].options.param = value;
                  // result_update(index);
 
                 },
  "prefilter"  : function(div, options, class_out, callback){

                   // execute before filter
 
                   // finally must call callback()

                   // display progress bar
                   // $("#progressbar").progressbar("option", "value", index*100/img_count );
                  
                   // check pause
                   // if(state.status=='wait') return;

                   // add new image
                   // result_image(div, src, 'new', class_out, callback)
                                        
                 }, 
  "filter"     : function(image, options, class_out, callback){

                   // image filter 

                   // finally must call callback()
 
                   // set label
                   // var class_out =  class_out == '*' ? image.data('class') : class_out;

                   // update image
                   // result_image(image, imageData, null, class_out, callback);

                 },
  "help"        : "Plugin help" // optionally
}