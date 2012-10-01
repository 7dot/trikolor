{
  "name"       : "Quantize",
  "options"    : {"levels" : 3 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/quantize.js',
                   'vendors/pixastic/actions/quantize.js'  
                 ],
  "html"       : "Number of colors: <span class=\"filter-levels\"></span><div class=\"filter-levels-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');

                   element.find('.filter-levels-slider').slider({
                     value: options.levels,
                     orientation: "horizontal",
                     range: "min",
                     min: 2,
                     max: 64,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-levels').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.levels = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-levels').text(options.levels);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('quantize', {"levels" : options.levels}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}