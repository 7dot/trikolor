{
  "name"       : "Open image",
  "options"    : { "filedata" : "" },
  "html"       : "<input type=\"file\" class=\"filter-file\" accept=\"image/*\" autocomplete=\"off\" /><br><div class=\"filter-preview\"></div>",
  "init"    : function(element,options){
                var index = element.data('index');
                var reader = new FileReader();
                reader.onload = function(e){
                  config.plugins[index].options.filedata = e.target.result;   
                  result_update(index);
                };

                element
                .find('.filter-file')
                .change(function(e){
                   reader.readAsDataURL(e.target.files[0]);                  
                });

                element
                .find('.filter-preview')
                .html( options.filedata? '<img style="width: 48px; height: auto;" src="'+options.filedata+'">' :'' );
  
              },
  "prefilter"  : function(div, options, class_out, callback){
                   if(options.filedata)
                     result_image(div, options.filedata, 'new', class_out, callback);
                   else callback();
                 }
}