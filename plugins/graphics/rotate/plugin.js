{
  "name"       : "Rotate",
  "options"    : {"angle" : 0 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/rotate.js'  
                 ],
  "html"       : "Angle: <span class=\"filter-angle\"></span><div class=\"filter-angle-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-angle-slider').slider({
                     value: options.angle,
                     orientation: "horizontal",
                     range: "min",
                     min: -180,
                     max: 180,
                     step: 1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-angle').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.angle = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-angle').text(options.angle);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('rotate', {"angle" : options.angle}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}