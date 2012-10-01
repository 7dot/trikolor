{
  "name"       : "Mosaic",
  "options"    : {"blocksize" : 5 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/mosaic.js'  
                 ],
  "html"       : "Block size: <span class=\"filter-blocksize\"></span><div class=\"filter-blocksize-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');

                   element.find('.filter-blocksize-slider').slider({
                     value: options.blocksize,
                     orientation: "horizontal",
                     range: "min",
                     min: 2,
                     max: 10,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-blocksize').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.blocksize = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-blocksize').text(options.blocksize);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('mosaic', {"blockSize" : options.blocksize}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}