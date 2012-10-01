{
  "name"       : "Lighten",
  "options"    : {"amount" : 0.5 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/lighten.js'  
                 ],
  "html"       : "Lightness: <span class=\"filter-amount\"></span><div class=\"filter-amount-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-amount-slider').slider({
                     value: options.amount,
                     orientation: "horizontal",
                     range: "min",
                     min: -1,
                     max: 1,
                     step: 0.01,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-amount').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.amount = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-amount').text(options.amount);

                 },
  "filter"     : function(image, options, class_out, callback){
                   if(options.amount == 0) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('lighten', {"amount" : options.amount}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}