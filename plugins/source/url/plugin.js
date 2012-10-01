{
  "name"    : "Download images by URLs (server)",
  "options" : { "urls" : "" },
  "html"    : "URLs (one per line)<br><textarea autocomplete=\"off\" class=\"filter-urls\" style=\"width: 98%;\"></textarea>",
  "init"    : function(element,options){
                var index = element.data('index');
                element.find('.filter-urls')
                .val(options.urls)
                .change(function(){ 
                  config.plugins[index].options.urls = $(this).val();
                  result_update(index);
                }); 
              },
  "prefilter"  : function(div, options, class_out, callback){
                   if(!options.urls) return callback();
                   this.urls = options.urls.split("\n");
                   img_count = this.urls.length;
                   this.last_url_index = img_count-1;                                                       
                   this.prefilter_load(div, class_out, callback, 0); 
                 }, 
  "prefilter_load" : function(div, class_out, callback, index){
                       if(state.status=='wait') return;
                       var obj = this;
                       $("#progressbar").progressbar("option", "value", index*100/img_count );
                       var url = proxy + encodeURIComponent(obj.urls[index]);
                       if(index == obj.last_url_index) 
                         result_image(div, url, 'new', class_out, callback);
                       else                                             
                         result_image(div, url, 'new', class_out, function(){
                           obj.prefilter_load(div, class_out, callback, ++index); 
                         });                        
                     }
}