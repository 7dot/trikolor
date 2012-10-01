{
  "name"       : "Threshold with dithering",
  "options"    : { 
                   "colors"    : ["rgb(0,0,0)","rgb(255,255,255)"],
                   "grayscale" : [0.299, 0.587, 0.114],   // [0.212, 0.715, 0.0722] 
                   "compare"   : "grayscale",
                   "quantize"  : false,
                   "solid"     : false
                 },
  "dynamic"    : ["compare"],
  "params"       : {
                    "compare"  : [["grayscale","grayscale"], ["delta rgb","delta rgb"]]
                   },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js',
                   'vendors/quantize.js', 
                   'vendors/pixastic/actions/set_colors_dith.js'  
                 ],
  "html"       : "<button class=\"filter-add\">Add color</button>"+
                 "<div class=\"filter-colors\"></div>"+
                 "Compare method: <div class=\"filter-compare\"></div>"+
                 "<div class=\"filter-quantize-div\"></div>"+
                 "<div class=\"filter-solid-div\"></div>",
  "init"       : function(element, options){

                  var index = element.data('index');
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  var div = element.find('.filter-colors');

                  $.each(options.colors,function(key,value){
                    $('<div class="filter-colors-row"><input class="filter-color" type="text" value="'+value+'" size="16"> <button class="filter-colors-row-delete">X</button></div>')
                    .appendTo(div)
                    .find('.filter-colors-row-delete')
                      .button({"text":false,"icons":{"primary":"ui-icon-circle-close"}})
                      .click(function(){ $(this).parent().remove(); obj.update(element); })
                      .end()
                    .find('.filter-color')
                      .change(function(){ obj.update(element); });                   
                  }); 

                  element.find('.filter-add').button().click(function(){
                    $('<div class="filter-colors-row"><input class="filter-color" type="text" value="rgb(0,0,0)" size="16"> <button class="filter-colors-row-delete">X</button></div>')
                    .appendTo(div)
                    .find('.filter-colors-row-delete')
                      .button({"text":false,"icons":{"primary":"ui-icon-circle-close"}})
                      .click(function(){ $(this).parent().remove(); obj.update(element); })
                      .end()
                    .find('.filter-color')
                      .change(function(){ obj.update(element); });
                    
                    obj.update(element);
                  });

                   for(var i in obj.dynamic){
                     var option = obj.dynamic[i];
                     var radio = element.find('.filter-'+option);
                     
                     for(var j in obj.params[option]){
                       var value=obj.params[option][j];
                       $('<input id="filter-'+option+'-'+value[0]+'-'+obj.id+'" type="radio" name="filter-'+option+'-'+obj.id+'" value="'+value[0]+'" '+(options[option]==value[0]?'checked':'')+' />')
                       .appendTo(radio)
                       .change(function(){
                         var option = $(this).prop('name').split('-')[1];
                         config.plugins[index].options[option] = $(this).val();
                         result_update(index);                   
                       })
                       .after('<label for="filter-'+option+'-'+value[0]+'-'+obj.id+'">'+value[1]+'</label>');
                     }

                     radio.buttonset();
                   }

                   $('<input id="filter-set_colors-quantize-'+obj.id+'" class="filter-quantize" type="checkbox" '+ (options.quantize? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-quantize-div'))
                   .after('<label for="filter-set_colors-quantize-'+obj.id+'">Quantize by palette</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.quantize = $(this).is(':checked');
                     result_update(index);                      
                   });

                   $('<input id="filter-set_colors-solid-'+obj.id+'" class="filter-solid" type="checkbox" '+ (options.solid? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-solid-div'))
                   .after('<label for="filter-set_colors-solid-'+obj.id+'">Solid color priority</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.solid = $(this).is(':checked');
                     result_update(index);                      
                   });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   if(options.colors.length<2) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;                 
                   image
                   .css('width','auto')
                   .pixastic('set_colors_dith', { "colors" : options.colors, "grayscale": options.grayscale, "quantize" : options.quantize, "solid" : options.solid, "compare" : options.compare }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 },
  "update"     : function(element){
                   var index = element.data('index');
                   var colors = [];
                   element.find('.filter-colors-row').each(function(){
                     var color  = $(this).find('.filter-color').val();
                     colors.push(color);
                   });
                   config.plugins[index].options.colors = colors;
                   result_update(index);                
                 },
  "help"        : ""
}