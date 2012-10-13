{
  "name"       : "Adaptive Thresholding",
  "options"    : { 
                   "grayscale" : [0.299, 0.587, 0.114],   // [0.212, 0.715, 0.0722]
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/threshold.js'  
                 ],
  "html"       : "",  
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('threshold', { "grayscale": options.grayscale }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 },
  "help"        : "Adaptive Thresholding using Integral Image ( http://blog.inspirit.ru/?p=322 )"
}