Pixastic.Actions.miniaturize = {

	process : function(params) {

		if (Pixastic.Client.hasCanvasImageData()) {

                  var f_grayscale = (params.options.compare === 'grayscale');

                  var colors = [], colors_grayscale = [];
                  for(var i=0; i<params.options.colors.length; i++){
                    var color = params.options.colors[i].match(/rgb\((\d+),(\d+),(\d+)\)/);
                    colors.push([color[1],color[2],color[3]]);
                    if(f_grayscale)
                      colors_grayscale.push(params.options.grayscale[0]*color[1] + params.options.grayscale[1]*color[2] + params.options.grayscale[2]*color[3]);
                  }

                var n = params.options.n,
                    p = params.options.p / 100;
                
                var data = Pixastic.prepareData(params);
                var rect = params.options.rect;
                var w = rect.width;
                var h = rect.height;
                var w4 = w*4;             

                var new_image = [], block_size = [], new_x, new_y, ratio;

                if(params.options.width && w > params.options.width){

                     new_x = parseInt(params.options.width);
                     ratio = w / new_x;
                     new_y = Math.ceil( h / ratio );
                       
                }else{

                   if(params.options.height && h > params.options.height){

                     new_y = parseInt(params.options.height);
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
                                                      var grayscale = params.options.grayscale[0]*r + params.options.grayscale[1]*g + params.options.grayscale[2]*b;
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

                                for(var i=0; i<new_x; i++){                                 
                                  block_size[i]=[];   
                                  for(var j=0; j<new_y; j++){
                                    block_size[i][j]=0;
                                    for(var t=0; t<colors.length; t++)
                                      block_size[i][j] += new_image[i][j][t];
                                  }
                                }

                                // paint
                                var y = h;
            			do {
            				var offsetY = (y-1)*w4;
            				var x = w;
            				do {
            					var offset = offsetY + (x-1)*4;

                                                var cur_x = Math.ceil( x/ratio )-1;
                                                var cur_y = Math.ceil( y/ratio )-1;
                                                if( cur_x >= new_x) cur_x = new_x - 1;
                                                if( cur_y >= new_y) cur_y = new_y - 1;
                                                var index;
                                                
                                                for(var t=0; t<colors.length; t++){
                                                  index = t;
                                                  if( new_image[cur_x][cur_y][t] / block_size[cur_x][cur_y] > p) break;
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