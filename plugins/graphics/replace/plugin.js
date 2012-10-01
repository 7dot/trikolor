{
  "name"       : "Replace colors",
  "options"    : { "colors" : [] },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/replace_colors.js'  
                 ],
  "html"       : "<button class=\"filter-add\">Add</button>" + 
                 "<div class=\"filter-colors\"></div>",
  "init"       : function(element, options){

                  var div = element.find('.filter-colors');
                  var obj = this;

                  $.each(options.colors,function(key,value){
                    $('<div class="filter-colors-row"><input class="filter-color filter-color-src" type="text" value="'+value[0]+'" size="16"> на <input class="filter-color filter-color-dest" type="text" value="'+value[1]+'" size="16"> <button class="filter-colors-row-delete">X</button></div>')
                    .appendTo(div)
                    .find('.filter-colors-row-delete')
                      .button({"text":false,"icons":{"primary":"ui-icon-circle-close"}})
                      .click(function(){ $(this).parent().remove(); obj.update(element); })
                      .end()
                    .find('.filter-color')
                      .change(function(){ obj.update(element); });                   
                  }); 

                  element.find('.filter-add').button().click(function(){
                    $('<div class="filter-colors-row"><input class="filter-color filter-color-src" type="text" value="rgb(0,0,0)" size="16"> to <input class="filter-color filter-color-dest" type="text" value="rgb(0,0,0)" size="16"> <button class="filter-colors-row-delete">X</button></div>')
                    .appendTo(div)
                    .find('.filter-colors-row-delete')
                      .button({"text":false,"icons":{"primary":"ui-icon-circle-close"}})
                      .click(function(){ $(this).parent().remove(); obj.update(element); })
                      .end()
                    .find('.filter-color')
                      .change(function(){ obj.update(element); });
                    
                    obj.update(element);
                  });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   if(!options.colors.length) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('replace_colors', {"colors" : options.colors}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 },
  "update"     : function(element){
                   var index = element.data('index');
                   var options = [];
                   element.find('.filter-colors-row').each(function(){
                     var color_src  = $(this).find('.filter-color-src').val();
                     var color_dest = $(this).find('.filter-color-dest').val();
                     options.push([color_src, color_dest]);
                   });
                   config.plugins[index].options.colors = options;
                   result_update(index);                
                 }
}