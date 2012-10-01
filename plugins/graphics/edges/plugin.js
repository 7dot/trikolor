{
  "name"       : "Edge Detection",
  "options"    : {
                   "mono"     : false,
                   "invert"   : false
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/edges.js'  
                 ],
  "html"       : "<div class=\"filter-mono-div\"></div>" + 
                 "<div class=\"filter-invert-div\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   $('<input id="filter-edges-mono-'+this.id+'" class="filter-mono" type="checkbox" '+ (options.mono? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-mono-div'))
                   .after('<label for="filter-edges-mono-'+this.id+'">Mono</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.mono = $(this).is(':checked');
                     result_update(index);                      
                   });

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
                   .pixastic('edges', {"invert" : options.invert, "mono" : options.mono}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}