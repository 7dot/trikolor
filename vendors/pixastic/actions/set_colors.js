Pixastic.Actions.set_colors = {

	process : function(params) {
 
		if (Pixastic.Client.hasCanvasImageData()) {

                var f_grayscale = (params.options.compare === 'grayscale');

                var colors = [], colors_grayscale = [];
                for(var i in params.options.colors){
                  var color = params.options.colors[i].match(/rgb\((\d+),(\d+),(\d+)\)/);
                  colors.push([color[1],color[2],color[3]]);
                  if(f_grayscale)
                    colors_grayscale.push(params.options.grayscale[0]*color[1] + params.options.grayscale[1]*color[2] + params.options.grayscale[2]*color[3]);
                }

			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			


                if(f_grayscale && params.options.scale){
                  var colors_begin=255, colors_end=0, 
                      image_begin=255, image_end=0, 
                      colors_length, image_length,
                      k, dis;
                  for(var i in colors_grayscale){
                    if(colors_grayscale[i] < colors_begin) colors_begin = colors_grayscale[i];
                    if(colors_grayscale[i] > colors_end) colors_end = colors_grayscale[i];
                  }
                  colors_length = colors_end - colors_begin;

                  var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;
                                        var r = data[offset];
                                        var g = data[offset+1];                      
                                        var b = data[offset+2]; 

                                        var grayscale = params.options.grayscale[0]*r + params.options.grayscale[1]*g + params.options.grayscale[2]*b;

                                        if(grayscale < image_begin) image_begin = grayscale;
                                        if(grayscale > image_end) image_end = grayscale;

				} while (--x);
			} while (--y);
                   image_length = image_end - image_begin;
                   
                   k = image_length / colors_length;
                   dis = colors_begin*k - image_begin;

                   for(var i in colors_grayscale)
                     colors_grayscale[i] = k * colors_grayscale[i] - dis;

                }            
   
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
                                          var grayscale = params.options.grayscale[0]*r + params.options.grayscale[1]*g + params.options.grayscale[2]*b;
                                          index = this.compare_grayscale(grayscale, colors_grayscale);
                                        }else{
                                          index = this.compare_rgb([r,g,b], colors); 
                                        }

                                        r = colors[index][0];
                                        g = colors[index][1];
                                        b = colors[index][2];
                               
					if (r < 0) r = 0; if (r > 255) r = 255;
					if (g < 0) g = 0; if (g > 255) g = 255;
					if (b < 0) b = 0; if (b > 255) b = 255;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
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