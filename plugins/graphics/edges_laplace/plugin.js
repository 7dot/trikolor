{
  "name"       : "Laplace Edge Detection",
  "options"    : {                  
                   "invert"       : true,
                   "greyLevel"    : 0,   // 0 - 255
                   "edgeStrength" : 5    // 0 - ?
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/laplace.js'  
                 ],
  "html"       : "Grey level: <span class=\"filter-greyLevel\"></span>%<div class=\"filter-greyLevel-slider\"></div>" + 
                 "Edge strength: <span class=\"filter-edgeStrength\"></span>%<div class=\"filter-edgeStrength-slider\"></div>" + 
                 "<div class=\"filter-invert-div\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-greyLevel-slider').slider({
                     value: options.greyLevel,
                     orientation: "horizontal",
                     range: "min",
                     min: 0,
                     max: 255,
                     step: 1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-greyLevel').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.greyLevel = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-greyLevel').text(options.greyLevel);

                   element.find('.filter-edgeStrength-slider').slider({
                     value: options.edgeStrength,
                     orientation: "horizontal",
                     range: "min",
                     min: 0,
                     max: 50,
                     step: 0.1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-edgeStrength').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.edgeStrength = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-edgeStrength').text(options.edgeStrength);

                   $('<input id="filter-edges-invert-'+this.id+'" class="filter-invert" type="checkbox" '+ (options.invert? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-invert-div'))
                   .after('<label for="filter-edges-invert-'+this.id+'">Invert</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.invert = $(this).is(':checked');
                     result_update(index);                      
                   });

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('laplace', {"invert" : options.invert, "greyLevel" : options.greyLevel, "edgeStrength" : options.edgeStrength}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}