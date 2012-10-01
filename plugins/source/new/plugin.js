{
  "name"    : "New image",
  "options" : { 
                "background" : "rgb(0,0,0)",
                "width"      : 48,
                "height"     : 48  
              },
  "html"    : "Background: <input type=\"text\" class=\"filter-background\"><br>Width: <input type=\"text\" class=\"filter-width\"><br>Height: <input type=\"text\" class=\"filter-height\">",
  "init"    : function(element,options){
                var index = element.data('index');
                element.find('.filter-background')
                .val(options.background)
                .change(function(){ 
                  config.plugins[index].options.background = $(this).val();
                  result_update(index);
                });
                element.find('.filter-width')
                .val(options.width)
                .change(function(){ 
                  config.plugins[index].options.width = $(this).val();
                  result_update(index);
                });
                element.find('.filter-height')
                .val(options.height)
                .change(function(){ 
                  config.plugins[index].options.height = $(this).val();
                  result_update(index);
                }); 
              },
  "prefilter"  : function(div, options, class_out, callback){
                   
                   var background = options.background || this.options.background;
                   var width = options.width || this.options.width;
                   var height = options.height || this.options.height;

                   var canvas, ctx;
                   canvas = document.createElement("canvas");
                   ctx = canvas.getContext("2d");
                   canvas.width = width;
                   canvas.height = height;
                   ctx.fillStyle = background;
                   ctx.fillRect(0, 0, width, height);

                   result_image(div, canvas.toDataURL("image/png"), 'new', class_out, callback);
                 }
}