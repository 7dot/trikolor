{
  "name"       : "Load local images",
  "options"    : { "mask" : "image_{$}.png", "amount" : "1" },
  "html"       : "Path - /images/<br>Filename pattern: <input type=\"text\" class=\"filter-mask\"><br>({$} - 1 to Amount)<br>Amount: <input type=\"text\" class=\"filter-amount\" size=\"3\">",
  "init"    : function(element,options){
                var index = element.data('index');
                element
                .find('.filter-mask')
                .val(options.mask)
                .change(function(){
                  config.plugins[index].options.mask = $(this).val();
                  result_update(index);
                }).end()                
                .find('.filter-amount')
                .val(options.amount)
                .change(function(){ 
                  config.plugins[index].options.amount = $(this).val();
                  result_update(index);
                });  
              },
  "prefilter"  : function(div, options, class_out, callback){
                   this.urls = [];
                   for(var i=1; i<=options.amount; i++)
                     this.urls.push(options.mask.replace('{$}',i));

                   img_count = this.urls.length;
                   this.last_url_index = img_count - 1;                                                       
                   if(img_count) this.prefilter_load(div, class_out, callback, 0); 
                 }, 
  "prefilter_load" : function(div, class_out, callback, index){
                       if(state.status=='wait') return;
                       var obj = this;  
                       $("#progressbar").progressbar("option", "value", index*100/img_count );
                       if(index == obj.last_url_index) 
                         result_image(div, 'images/'+obj.urls[index], 'new', class_out, callback);
                       else                                             
                         result_image(div, 'images/'+obj.urls[index], 'new', class_out, function(){
                           obj.prefilter_load(div, class_out, callback, ++index); 
                         });                        
                     }
}