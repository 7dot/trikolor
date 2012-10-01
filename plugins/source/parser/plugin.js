{
  "name"    : "Image parser (server)",
  "options" : { "page" : "", "mask" : "img[^>]+?src\\s*=\\s*(['\"])([^\\1]+?)\\1" },
  "html"    : "Load image from web page (only absolute links)<br>URL:<br><input type=\"text\" class=\"filter-page\" style=\"width: 98%;\"><br>Regexp pattern:<br><input type=\"text\" class=\"filter-mask\" style=\"width: 98%;\">",
  "init"    : function(element,options){
                var index = element.data('index');
                element.find('.filter-page')
                .val(options.page)
                .change(function(){ 
                  config.plugins[index].options.page = $(this).val();
                  result_update(index);
                }); 
                element.find('.filter-mask')
                .val(options.mask)
                .change(function(){ 
                  config.plugins[index].options.mask = $(this).val();
                  result_update(index);
                }); 
              },
  "prefilter"  : function(div, options, class_out, callback){

                   if(!options.page || !options.mask) return callback();
                   var obj = this;
                   $.get(proxy+encodeURIComponent(options.page), function(data){
                     var base = options.page.substring(0,options.page.lastIndexOf('/'));
                     var pattern = new RegExp(options.mask,'gim');
                     var imgs = data.match(pattern); 
                     pattern = new RegExp(options.mask,'im');
                     obj.urls=[];

                     // todo - + base tag & relative links
                     // todo - + links with / ../

                     for(var i in imgs){
                       var temp = imgs[i].match(pattern);
                       if(temp[2] && temp[2].indexOf('http')===0) obj.urls.push(temp[2]);
                       else obj.urls.push(base + (temp[2].charAt(0)=='/'?'':'/') + temp[2])
                     };

                     if(obj.urls.length){
                       img_count = obj.urls.length;
                       obj.last_url_index = img_count - 1;
                       obj.prefilter_load(div, class_out, callback, 0);
                     }

                   },'html');
            
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