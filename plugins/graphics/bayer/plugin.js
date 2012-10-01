{
  "name"       : "Dithering Bayer",
  "options"    : { 
                   "color"     : true,
                   "map"       : "4",
                   "grayscale" : [0.299, 0.587, 0.114]   // [0.212, 0.715, 0.0722]
                 },
  "dynamic"    : ["map"],
  "params"       : {
                    "map"  : [["2","2x2"], ["3","3x3"], ["4","4x4"], ["8","8x8"]]
                   },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/bayer.js'  
                 ],
  "html"       : "<div class=\"filter-map\"></div><div class=\"filter-color-div\"></div>",
  "init"       : function(element, options){

                  var index = element.data('index');           
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  var div = element.find('.filter-colors');

                  $('<input id="filter-atkinson-color-'+obj.id+'" class="filter-color" type="checkbox" '+ (options.color? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-color-div'))
                   .after('<label for="filter-atkinson-color-'+obj.id+'">Color</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.color = $(this).is(':checked');
                     result_update(index);                      
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

 
                 }, 
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('bayer', { "color" : options.color, "map" : options.map,"grayscale": options.grayscale }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}