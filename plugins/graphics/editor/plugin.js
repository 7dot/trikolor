{
  "name"       : "Pixel Editor",
  "options"    : { "width_limit" : 50, "height_limit" : 50 },
  "load"       : [
                   'vendors/pixie/stylesheets/pixie.css',
                   'vendors/pixie/javascripts/jqcolor.js',
                   'vendors/pixie/javascripts/jquery.hotkeys-0.7.9.min.js',
                   'vendors/pixie/javascripts/pixie.js'
                  ],
  "html"       : "Limitations: width <= 50 px, height <= 50 px, palette <= 256 colors",
  "filter"     : function(image, options, class_out, callback){
                   var div = $('<div title="Pixel Editor"></div>')
                   .appendTo('body');

                   $('<img>')
                   .appendTo('body')
                   .prop('src',image.prop('src'))
                   .load(function(){
                     var width  = $(this).width();
                     var height = $(this).height();
                     
                     if(width>options.width_limit || height>options.height_limit){
                       callback();
                       $(this).remove();
                       return;
                     } 
                 
                     var canvas, ctx;
                     canvas = document.createElement("canvas");
                     ctx = canvas.getContext("2d");
                     canvas.width = width;
                     canvas.height = height;
                     ctx.drawImage($(this).get(0), 0, 0);
                     var imgd = ctx.getImageData(0, 0, width, height);
                     var pix = imgd.data;

                     var editor = $('<div class="filter-editor"></div>')
                     .pixie({
                       width: width,
                       height: height,
                       initializer: function(canvas) {

                         var pixels = [];
                         for (var i = 0, n = pix.length; i < n; i += 4)
                         pixels.push('#' + 
                           canvas.toHex(pix[i  ]) +
                           canvas.toHex(pix[i+1]) +
                           canvas.toHex(pix[i+2])
                         );

                         canvas.addAction({
                           name: "Reset",
                           perform: function(canvas){ 
                             var i = 0;
                             canvas.eachPixel(function() {
                               this.css("backgroundColor", pixels[i++]);
                             }); 
                           }
                         });

                         canvas.addAction({
                           name: "Save",
                           perform: function(canvas){ 
                             result_image(image, canvas.toDataURL_("image/png"), null, class_out, function(){ 
                                                           div.dialog( "close" );
                                                         }); 
                           }
                         });

                         var i = 0;
                           canvas.eachPixel(function() {
                           this.css("backgroundColor", pixels[i++]);
             });
              
                       }
                     })
                     .appendTo(div);                 

                     $(this).remove();

                     div.dialog({
                       modal: true,
                       width: 'auto',
                       height: 'auto',
                       close: function(){ callback(); },
                       // open: function(){  }
                     });

                   });
    
                 }
}