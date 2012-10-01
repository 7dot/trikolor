{
  "name"       : "Resize",
  "options"    : {
                   "image_width"   : "",
                   "image_height"  : "",
                   "ratio"         : "none",
                   "canvas_width"  : "",
                   "canvas_height" : "",
                   "scale"         : "none",
                   "background"    : "rgb(255,255,255)",
                   "anchor"        : "lt"
                 },
  "dynamic"    : ["ratio", "scale", "anchor"],
  "params"       : {
                   "ratio"  : [["none","none"], ["width", "by width"], ["height", "by height"]],
                   "scale"  : [["none","none"], ["crop","crop"], ["background","add background"]],
                   "anchor" : [["lt","<span class=\"ui-icon ui-icon-carat-1-nw\"></span>"],
                               ["ct","<span class=\"ui-icon ui-icon-carat-1-n\"></span>"],
                               ["rt","<span class=\"ui-icon ui-icon-carat-1-ne\"></span>"],
                               ["lm","<span class=\"ui-icon ui-icon-carat-1-w\"></span>"],
                               ["cm","<span class=\"ui-icon ui-icon-radio-on\"></span>"],
                               ["rm","<span class=\"ui-icon ui-icon-carat-1-e\"></span>"],
                               ["lb","<span class=\"ui-icon ui-icon-carat-1-sw\"></span>"],
                               ["cb","<span class=\"ui-icon ui-icon-carat-1-s\"></span>"],
                               ["rb","<span class=\"ui-icon ui-icon-carat-1-se\"></span>"]],
                  },
  "html"       : "<fieldset><legend>Image:</legend>original if empty"+
                 "<br>Width: <input size=\"4\" type=\"text\" class=\"filter-image-width\">"+
                 " Height: <input size=\"4\" type=\"text\" class=\"filter-image-height\">"+
                 "<br>Ratio: <div class=\"filter-ratio\"></div>"+
                 "</fieldset>"+
                 "<fieldset><legend>Canvas:</legend>image options if empty"+
                 "<br>Width: <input size=\"4\" type=\"text\" class=\"filter-canvas-width\">"+
                 " Heigth: <input size=\"4\" type=\"text\" class=\"filter-canvas-height\">"+
                 "<br>Background: <input size=\"16\" type=\"text\" class=\"filter-background\">"+
                 "<br>Scale: <div class=\"filter-scale\"></div>"+
                 "Anchor: <div class=\"filter-anchor\"></div>"+
                 "</fieldset>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   var obj = this;
                   obj.id = Math.floor(Math.random()*10000);

                   element.find('.filter-image-width')
                   .val(options.image_width)
                   .change(function(){ 
                     config.plugins[index].options.image_width = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-image-height')
                   .val(options.image_height)
                   .change(function(){ 
                     config.plugins[index].options.image_height = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-canvas-width')
                   .val(options.canvas_width)
                   .change(function(){ 
                     config.plugins[index].options.canvas_width = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-canvas-height')
                   .val(options.canvas_height)
                   .change(function(){ 
                     config.plugins[index].options.canvas_height = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-background')
                   .val(options.background)
                   .change(function(){ 
                     config.plugins[index].options.background = $(this).val();
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
                   var anchors = element.find('.filter-anchor > label');
                   anchors.eq(0).removeClass('ui-corner-left').addClass('ui-corner-tl');
                   anchors.eq(2).addClass('ui-corner-tr').after('<br>');
                   anchors.eq(5).after('<br>');
                   anchors.eq(6).addClass('ui-corner-bl');
                   anchors.eq(8).removeClass('ui-corner-right').addClass('ui-corner-br');

                 },
  "filter"     : function(image, options, class_out, callback){
                   
                   image
                   .css('width','auto');

                   var width_original = image.width();
                   var height_original = image.height();

                   var width, height;

                   switch(options.ratio){
                     case 'none':
                        width = options.image_width || width_original;
                        height = options.image_height || height_original;  
                       break;
                     case 'width':
                        width = options.image_width || width_original;
                        height = width * height_original / width_original;  
                       break;
                     case 'height':
                        height = options.image_height || height_original;
                        width = height * width_original / height_original;  
                       break;
                   }

                   width  = Math.floor(width);
                   height = Math.floor(height);

                   var canvas_, ctx_;
                   canvas_ = document.createElement("canvas");
                   ctx_ = canvas_.getContext("2d");
                   canvas_.width = width;
                   canvas_.height = height;
                   ctx_.drawImage(image.get(0), 0, 0, width_original, height_original, 0, 0, width, height);

                   var canvas, ctx;
                   canvas = document.createElement("canvas");
                   ctx = canvas.getContext("2d");
                   canvas.width = options.canvas_width || width;
                   canvas.height = options.canvas_height || height;
                     
                   ctx.fillStyle = options.background;
                   ctx.fillRect(0, 0, canvas.width, canvas.height);

                   var sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight;

                   switch(options.scale){
                     case 'none':
                       if(width > canvas.width){ 
                         sWidth = canvas.width;
                         dWidth = canvas.width;
                         if(options.anchor.charAt(0)=='l') sx = 0;
                         else if(options.anchor.charAt(0)=='c') sx = (width - canvas.width) / 2;
                         else sx = width - canvas.width;
                         dx = 0;
                       }else{
                         sWidth = width;
                         dWidth = width;
                         sx = 0;
                         if(options.anchor.charAt(0)=='l') dx = 0;
                         else if(options.anchor.charAt(0)=='c') dx = (canvas.width - width) / 2;
                         else dx = canvas.width - width;
                       }

                       if(height > canvas.height){ 
                         sHeight = canvas.height;
                         dHeight = canvas.height;
                         if(options.anchor.charAt(1)=='t') sy = 0;
                         else if(options.anchor.charAt(1)=='m') sy = (height - canvas.height) / 2;
                         else sy = height - canvas.height;
                         dy = 0;
                       }else{
                         sHeight = height;
                         dHeight = height;
                         sy = 0;
                         if(options.anchor.charAt(1)=='t') dy = 0;
                         else if(options.anchor.charAt(1)=='m') dy = (canvas.height - height) / 2;
                         else dy = canvas.height - height;
                       }   
                       break;
                     case 'crop':
                         var image_ratio = width / height;
                         var canvas_ratio = canvas.width / canvas.height;
                         if(image_ratio*canvas.height > canvas.width){
                           sHeight = height;
                           sWidth  = height * canvas_ratio;
                           dWidth = canvas.width;
                           dHeight = canvas.height;
                           if(options.anchor.charAt(0)=='c') sx = (width - sWidth) / 2;
                           else if(options.anchor.charAt(0)=='r') sx = width - sWidth;
                           else sx = 0; 
                           sy = 0;
                           dx = 0;
                           dy = 0;
                         }else{
                           sHeight = width / canvas_ratio;
                           sWidth  = width;
                           dWidth = canvas.width;
                           dHeight = canvas.height;
                           sx = 0;
                           if(options.anchor.charAt(1)=='m') sy = (height - sHeight) / 2;
                           else if(options.anchor.charAt(1)=='b') sy = height - sHeight;
                           else sy = 0; 
                           dx = 0;
                           dy = 0;
                         }
                       break;
                     case 'background':
                         var image_ratio = width / height;
                         var canvas_ratio = canvas.width / canvas.height;
                         if(image_ratio*canvas.height > canvas.width){
                           sHeight = height;
                           sWidth  = width;
                           dWidth = canvas.width;
                           dHeight = canvas.width / image_ratio;
                           sx = 0;
                           sy = 0;
                           dx = 0;
                           if(options.anchor.charAt(1)=='m') dy = (canvas.height - dHeight) / 2;
                           else if(options.anchor.charAt(1)=='b') dy = canvas.height - dHeight;
                           else dy = 0; 
                         }else{
                           sHeight = height;
                           sWidth  = width;
                           dWidth = canvas.height *  image_ratio;
                           dHeight = canvas.height;
                           sx = 0;
                           sy = 0;
                           if(options.anchor.charAt(0)=='c') dx = (canvas.width - dWidth) / 2;
                           else if(options.anchor.charAt(0)=='r') dx = canvas.width - dWidth;
                           else dx = 0;
                           dy = 0;
                         }  
                       break;
                   }

                   // console.log("sx - "+sx+"; sy - "+sy+"; sWidth - "+sWidth+"; sHeight - "+sHeight+"; dx - "+dx+"; dy - "+dy+"; dWidth - "+dWidth+"; dHeight - "+dHeight);

                   ctx.drawImage(canvas_, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

                   result_image(image, canvas.toDataURL("image/png"), null, class_out, callback);
                 }
}