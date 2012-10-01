{
  "name"       : "Miniaturize",
  "options"    : { 
                   "colors"     : ["rgb(0,0,0)","rgb(255,255,255)"],
                   "grayscale"  : [0.299, 0.587, 0.114],   // [0.212, 0.715, 0.0722]
                   "compare"    : "grayscale", 
                   "n"          : "4",
                   "p"          : 25,
                   "width"      : "",
                   "height"     : ""
                 },
  "dynamic"    : ["compare"],
  "params"     : {
                  "compare"  : [["grayscale","grayscale"], ["delta rgb","delta rgb"]]
                 },
  "html"       : "Color ordering: 1 - foreground ... n - background"+
                 "<button class=\"filter-add\">Add color</button>"+
                 "<div class=\"filter-colors\"></div>"+
                 "Compare method: <div class=\"filter-compare\"></div>"+
                 "Percentage of color: <span class=\"filter-p\"></span>%<div class=\"filter-p-slider\"></div>"+
                 "New size:<br>width: <input size=\"4\" type=\"text\" class=\"filter-width\"> "+
                 "or height: <input size=\"4\" type=\"text\" class=\"filter-height\">"+
                 "<br>or reduce image by: <span class=\"filter-n\"></span> times<div class=\"filter-n-slider\"></div>",
  "init"       : function(element, options){

                  var index = element.data('index');
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  var div = element.find('.filter-colors');

                  $.each(options.colors,function(key,value){
                    $('<div class="filter-colors-row">'+(key+1)+'. <input class="filter-color" type="text" value="'+value+'" size="16"> <button class="filter-colors-row-delete">X</button></div>')
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

                   element.find('.filter-n-slider').slider({
                     value: options.n,
                     orientation: "horizontal",
                     range: "min",
                     min: 2,
                     max: 100,
                     step: 1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-n').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.n = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-n').text(options.n);

                   element.find('.filter-p-slider').slider({
                     value: options.p,
                     orientation: "horizontal",
                     range: "min",
                     min: 1,
                     max: 50,
                     step: 1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-p').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.p = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-p').text(options.p);

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
  "help"       : "Usage: vector effect - apply with edge detection on large image",  
  "filter"     : function(image, options, class_out, callback){

                   if(options.colors.length<2) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;

                   image
                   .css('width','auto');

                   var width_original = image.width();
                   var height_original = image.height();

                   var canvas_, ctx_;
                   canvas_ = document.createElement("canvas");
                   ctx_ = canvas_.getContext("2d");
                   canvas_.width = width_original;
                   canvas_.height = height_original;
                   ctx_.drawImage(image.get(0), 0, 0);

                   var canvas, ctx;
                   canvas = document.createElement("canvas");
                   ctx = canvas.getContext("2d");
                   
                   var params = { 
                     "colors"    : options.colors, 
                     "compare"   : options.compare, 
                     "grayscale" : options.grayscale, 
                     "width"     : options.width, 
                     "height"    : options.height, 
                     "n"         : options.n, 
                     "p"         : options.p, 
                     "rect"      : { "width": width_original, "height": height_original } 
                   };
                   var oldData = ctx_.getImageData(0, 0, width_original, height_original);
                   var new_image = this.miniaturize.process( oldData.data, params );
                   canvas.width = new_image.width;
                   canvas.height = new_image.height;
                   var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                   var data = imageData.data;
                   for (var i = 0, il = data.length; i < il; i++)
                     data[i] = new_image.data[i];
                   ctx.putImageData(imageData, 0, 0);
                   result_image(image, canvas.toDataURL("image/png"), null, class_out, callback);

                 },
  "miniaturize" : {

	process : function(data, options) {

                  var f_grayscale = (options.compare === 'grayscale');

                  var colors = [], colors_grayscale = [];
                  for(var i=0; i < options.colors.length; i++){
                    var color = options.colors[i].match(/rgb\((\d+),(\d+),(\d+)\)/);
                    colors.push([color[1],color[2],color[3]]);
                    if(f_grayscale)
                      colors_grayscale.push(options.grayscale[0]*color[1] + options.grayscale[1]*color[2] + options.grayscale[2]*color[3]);
                  }

                var n = options.n,
                    p = options.p / 100;
                
                var w = options.rect.width;
                var h = options.rect.height;
                var w4 = w*4;             

                var new_image = [], new_x, new_y, ratio;

                if(options.width && w > options.width){

                     new_x = parseInt(options.width);
                     ratio = w / new_x;
                     new_y = Math.ceil( h / ratio );
                       
                }else{

                   if(options.height && h > options.height){

                     new_y = parseInt(options.height);
                     ratio = h / new_y;
                     new_x = Math.ceil( w / ratio );

                   }else{

                     ratio = n
                     new_x = Math.ceil( w / ratio );
                     new_y = Math.ceil( h / ratio );

                   }
                }                  

                for(var i=0; i<new_x; i++){
                  new_image[i]=[]; 
                  for(var j=0; j<new_y; j++){
                    new_image[i][j]=[];
                    for(var t=0; t<colors.length; t++)
                      new_image[i][j][t]=0;
                  }
                }
 
                                // count
                                var y = h;
            			do {
            				var offsetY = (y-1)*w4;
            				var x = w;
            				do {
            					var offset = offsetY + (x-1)*4;
                                                    var r = data[offset];
                                                    var g = data[offset+1];
                                                    var b = data[offset+2];
                                                    var index;

                                                    if(f_grayscale){
                                                      var grayscale = options.grayscale[0]*r + options.grayscale[1]*g + options.grayscale[2]*b;
                                                      index = this.compare_grayscale(grayscale, colors_grayscale);
                                                    }else{
                                                      index = this.compare_rgb([r,g,b], colors); 
                                                    }

                                                    var cur_x = Math.ceil( x/ratio )-1;
                                                    var cur_y = Math.ceil( y/ratio )-1;
                                                    if( cur_x >= new_x) cur_x = new_x - 1;
                                                    if( cur_y >= new_y) cur_y = new_y - 1;
                                                    new_image[cur_x][cur_y][index]++;

            				} while (--x);
            			} while (--y);

                                var new_data = [];
                                for(var j=0; j<new_y; j++){
                                  for(var i=0; i<new_x; i++){                                   
                                    var block_size=0;
                                    for(var t=0; t<colors.length; t++)
                                      block_size += new_image[i][j][t];
                                    var index;
                                    for(var t=0; t<colors.length; t++){
                                      index = t;
                                      if( new_image[i][j][t] / block_size > p) break;
                                    }

                                        r = colors[index][0];
                                        g = colors[index][1];
                                        b = colors[index][2];
                               
					if (r < 0) r = 0; if (r > 255) r = 255;
					if (g < 0) g = 0; if (g > 255) g = 255;
					if (b < 0) b = 0; if (b > 255) b = 255;

					new_data.push(r);
                                        new_data.push(g);
                                        new_data.push(b);
                                        new_data.push(255);
                                    
                                  }
                                }

		return { 
                         "data"   : new_data,
                         "width"  : new_x,
                         "height" : new_y
                       };

	},
	compare_grayscale : function(sample, colors_grayscale) {
	  var index, d=256;
          for(var i in colors_grayscale){
            var delta = Math.abs(colors_grayscale[i]-sample); 
            if(delta < d){
              index = i;
              d = delta;
            }
          }
          return index;	
	},
	compare_rgb : function(sample, colors){
	  var index, d=195076;

          for(var i in colors){
            var delta = Math.pow(colors[i][0]-sample[0],2)+Math.pow(colors[i][1]-sample[1],2)+Math.pow(colors[i][2]-sample[2],2); 
            if(delta < d){
              index = i;
              d = delta;
            }
          }
          return index;	
	}

   }
}