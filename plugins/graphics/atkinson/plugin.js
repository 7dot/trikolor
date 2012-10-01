{
  "name"       : "Dithering Atkinson",
  "options"    : { 
                   "color"     : true,
                   "grayscale" : [0.299, 0.587, 0.114]   // [0.212, 0.715, 0.0722]
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/atkinson.js'  
                 ],
  "html"       : "<div class=\"filter-color-div\"></div>",
  "init"       : function(element, options){

                  var div = element.find('.filter-colors');
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  $('<input id="filter-atkinson-color-'+obj.id+'" class="filter-color" type="checkbox" '+ (options.color? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-color-div'))
                   .after('<label for="filter-atkinson-color-'+obj.id+'">Color</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.color = $(this).is(':checked');
                     result_update(index);                      
                   });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('atkinson', { "color" : options.color,"grayscale": options.grayscale }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}