{
  "name"       : "Crop",
  "load"       : [
                   'vendors/tapmodo-Jcrop/css/jquery.Jcrop.min.css',
                   'vendors/tapmodo-Jcrop/js/jquery.Jcrop.min.js',
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/crop.js' 
                  ],
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   var div = $('<div title="Crop"></div>').appendTo('body');
                   var coords = null;
                   var jcrop_api;

                   var img = $('<img>')
                   .appendTo(div)
                   .prop('src',image.prop('src'))
                   .load(function(){

                     div.dialog({
                       modal:   true,
                       width:   'auto',
                       height:  'auto',
                       buttons: {
				  "Crop": function() {
                                                jcrop_api.destroy();
                                                if(coords){
                                                  var class_out =  class_out == '*' ? image.data('class') : class_out;
                                                  img
                                                  .pixastic('crop', {
		                                                        rect : {
			                                                          left : coords.x, 
                                                                                  top : coords.y, 
                                                                                  width : coords.w, 
                                                                                  height : coords.h
		                                                               }
	                                                             }, 
                                                     function(res){
                                                         result_image(image, res.toDataURL("image/png"), null, class_out, function(){ 
                                                           div.dialog( "close" );
                                                         });
                                                  });
                                                }
				              },
				  "Cancel"   : function() {
					         div.dialog( "close" );
				               }
			        },
                       close:   function(){ div.remove(); callback(); },
                       open:    function(){
                                  img.Jcrop({
                                    onSelect : function(c){ coords = c; },
                                    onChange : function(c){ coords = c; },
                                    onRelease: function(c){ coords = null; }
                                  },function(){ jcrop_api = this; });
                                }
                     });

                   });
    
                 }
}