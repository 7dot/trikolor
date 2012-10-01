Pixastic.Actions.set_colors_dith = {

	process : function(params) {

		if (Pixastic.Client.hasCanvasImageData()) {

                var f_grayscale = (params.options.compare === 'grayscale');

                var colors = [], colors_grayscale = [];
                for(var i in params.options.colors){
                  var color = params.options.colors[i].match(/rgb\((\d+),(\d+),(\d+)\)/);
                  colors.push([parseInt(color[1], 10),parseInt(color[2], 10),parseInt(color[3], 10)]);
                  colors_grayscale.push(params.options.grayscale[0]*color[1] + params.options.grayscale[1]*color[2] + params.options.grayscale[2]*color[3]);
                }

                var patterns = [], patterns_grayscale = [], patterns_rgb = [], patterns_solid=[];
                for(var i=0; i<params.options.colors.length; i++){
                  patterns = patterns.concat(this.get_patterns_1(i));
                  if(params.options.quantize && params.options.solid)
                    patterns_solid.push(patterns[i]);
                }

                for(var i=0; i<params.options.colors.length; i++)
                  for(var j=i+1; j<params.options.colors.length; j++)
                    patterns = patterns.concat(this.get_patterns_2(i, j, colors_grayscale[i], colors_grayscale[j]));

                if(f_grayscale){
                  for(var i=0; i<patterns.length; i++)
                    patterns_grayscale.push(this.pattern_grayscale(patterns[i], colors_grayscale));
                }else{
                  for(var i=0; i<patterns.length; i++)
                    patterns_rgb.push(this.pattern_rgb(patterns[i], colors));
                }

                var data = Pixastic.prepareData(params);
                var rect = params.options.rect;
                var w = rect.width;
                var h = rect.height;
                var w4 = w*4;

               if(params.options.quantize){

                 var maxColors = patterns.length;
                 var myPixels = [];


			var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;
                                        myPixels.push([data[offset],data[offset+1],data[offset+2]]);
				} while (--x);
			} while (--y);

                        var cmap = MMCQ.quantize(myPixels, maxColors);

                        

                        var newPalette = cmap.palette();
                        var newPixels = myPixels.map(function(p) {
                          return cmap.map(p);
                        });

                        var newPalette_bind = [], patterns_exclude = [];
                        var i = 0;

                        if(params.options.solid){
                          var newPalette_count = [];
                          for(var i=0; i<newPalette.length; i++)
                            newPalette_count.push(0);
                          for(var j=0; j < newPixels.length; j++ ){
                            for(var i=0; i<newPalette.length; i++)
                                  if(newPalette[i][0]===newPixels[j][0] && newPalette[i][1]===newPixels[j][1] && newPalette[i][2]===newPixels[j][2]){
                                    newPalette_count[i]++;
                                    break;
                                  }
                          }

                          var newPalette_sort = [];
                          for(var i=0; i<newPalette.length; i++){
                            var index=0, d=0;
                            for(var j=0; j<newPalette_count.length; j++)
                              if(newPalette_count[j]>d){
                                d = newPalette_count[j];
                                index = j;
                              }
                            newPalette_count[index]=0;
                            newPalette_sort.push(newPalette[index]);
                          }

                          newPalette = newPalette_sort;

                          for(var i=patterns_solid.length; i<patterns.length; i++)
                            patterns_exclude.push(i);

                        for(var i=0; i<patterns_solid.length; i++){
                          if(f_grayscale){
                            var grayscale = Math.round(params.options.grayscale[0]*newPalette[i][0] + params.options.grayscale[1]*newPalette[i][1] + params.options.grayscale[2]*newPalette[i][2]);
                            var index = this.compare_grayscale_exclude(grayscale, patterns_grayscale, patterns_exclude);
                          }else{
                            var index = this.compare_rgb_exclude([newPalette[i][0],newPalette[i][1],newPalette[i][2]], patterns_rgb, patterns_exclude);
                          }

                          if(index!==undefined){
                            patterns_exclude.push(index);
                            newPalette_bind.push(index);
                          }else{
                            newPalette_bind.push(patterns.length-1);
                          }
                          
                        }                          

                          patterns_exclude = [];
                          for(var i=0; i<patterns_solid.length; i++)
                            patterns_exclude.push(i);

                          var i = patterns_solid.length;  
                          
                        }

                        for(i; i<newPalette.length; i++){
                          if(f_grayscale){
                            var grayscale = Math.round(params.options.grayscale[0]*newPalette[i][0] + params.options.grayscale[1]*newPalette[i][1] + params.options.grayscale[2]*newPalette[i][2]);
                            var index = this.compare_grayscale_exclude(grayscale, patterns_grayscale, patterns_exclude);
                          }else{
                            var index = this.compare_rgb_exclude([newPalette[i][0],newPalette[i][1],newPalette[i][2]], patterns_rgb, patterns_exclude);
                          }

                          if(index!==undefined){
                            patterns_exclude.push(index);
                            newPalette_bind.push(index);
                          }else{
                            newPalette_bind.push(patterns.length-1);
                          }
                          
                        }

                        newPixels.reverse();

            		var y = h;
            		do {
            		  var offsetY = (y-1)*w4;
            		  var x = w;
            		  do {
            			var offset = offsetY + (x-1)*4;
                                var color = newPixels.pop();


            			var r = color[0];
            			var g = color[1];
            			var b = color[2];

                                for(var i=0; i<newPalette.length; i++)
                                  if(newPalette[i][0]===r && newPalette[i][1]===g && newPalette[i][2]===b){
                                    var index = newPalette_bind[i];
                                    break;
                                  }

                                color = colors[this.pattern_pixel(patterns[index], x, y)];
                                r = color[0];
                                g = color[1];
                                b = color[2];

            			if (r < 0) r = 0; if (r > 255) r = 255;
            			if (g < 0) g = 0; if (g > 255) g = 255;
            			if (b < 0) b = 0; if (b > 255) b = 255;

            			data[offset] = r;
            			data[offset+1] = g;
            			data[offset+2] = b;

            		  } while (--x);
            		} while (--y);

                }else{

                                var y = h;
            			do {
            				var offsetY = (y-1)*w4;
            				var x = w;
            				do {
            					var offset = offsetY + (x-1)*4;
                                                    var r = data[offset];
                                                    var g = data[offset+1];
                                                    var b = data[offset+2];


                                                    if(f_grayscale){
                                                      var grayscale = Math.round(params.options.grayscale[0]*r + params.options.grayscale[1]*g + params.options.grayscale[2]*b);
                                                      var index = this.compare_grayscale(grayscale, patterns_grayscale);
                                                    }else{
                                                      var index = this.compare_rgb([r,g,b], patterns_rgb);
                                                    }

                                                    var color = colors[this.pattern_pixel(patterns[index], x, y)];
                                                    r = color[0];
                                                    g = color[1];
                                                    b = color[2];

            					if (r < 0) r = 0; if (r > 255) r = 255;
            					if (g < 0) g = 0; if (g > 255) g = 255;
            					if (b < 0) b = 0; if (b > 255) b = 255;

            					data[offset] = r;
            					data[offset+1] = g;
            					data[offset+2] = b;

            				} while (--x);
            			} while (--y);


                }

		return true;
	    }
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	},
	compare_grayscale : function(sample, colors_grayscale) {
	  var index, d=256, length=colors_grayscale.length;
          for(var i=0; i<length; i++){
            var delta = Math.abs(colors_grayscale[i]-sample);
            if(delta < d){
              index = i;
              d = delta;
            }
          }
          return index;
	},
	compare_rgb : function(sample, colors_rgb){
	  var index, d=195076, length=colors_rgb.length;
          for(var i=0; i<length; i++){
          var delta = Math.pow(colors_rgb[i][0]-sample[0],2) + Math.pow(colors_rgb[i][1]-sample[1],2) + Math.pow(colors_rgb[i][2]-sample[2],2);
            if(delta < d){
              index = i;
              d = delta;
            }
          }
          return index;
	},
	get_patterns_1 : function(c1){
          return [[[c1,c1,c1,c1],[c1,c1,c1,c1],[c1,c1,c1,c1],[c1,c1,c1,c1]]];
	},
	get_patterns_2 : function(color1, color2, grayscale1, grayscale2){
          var c1=color1, c2=color2;
          if(grayscale1 > grayscale2){
            c2=color1;
            c1=color2;
          }
          return [
                  [[c1,c2,c2,c2],[c2,c2,c1,c2],[c1,c2,c2,c2],[c2,c2,c1,c2]],
                  [[c1,c2,c1,c2],[c2,c1,c2,c1],[c1,c2,c1,c2],[c2,c1,c2,c1]],
                  [[c1,c1,c1,c2],[c1,c2,c1,c1],[c1,c1,c1,c2],[c1,c2,c1,c1]]
                 ];
	},
	pattern_grayscale : function(pattern, grayscale){
          return Math.round((grayscale[pattern[0][0]] + grayscale[pattern[0][1]] + grayscale[pattern[1][0]] + grayscale[pattern[1][1]])/4);
	},
	pattern_rgb : function(pattern, colors){
          return [
                  Math.round((colors[pattern[0][0]][0] + colors[pattern[0][1]][0] + colors[pattern[1][0]][0] + colors[pattern[1][1]][0])/4),
                  Math.round((colors[pattern[0][0]][1] + colors[pattern[0][1]][1] + colors[pattern[1][0]][1] + colors[pattern[1][1]][1])/4),
                  Math.round((colors[pattern[0][0]][2] + colors[pattern[0][1]][2] + colors[pattern[1][0]][2] + colors[pattern[1][1]][2])/4)
                 ];
	},
	pattern_pixel : function(pattern, x, y){
          var x = x%4;
          var y = y%4;
          return pattern[y][x];
	},
	compare_grayscale_exclude : function(sample, colors_grayscale, exclude) {
	  var index=undefined, d=256, length=colors_grayscale.length;
          for(var i=0; i<length; i++) if(exclude.indexOf(i)===-1){
            var delta = Math.abs(colors_grayscale[i]-sample);
            if(delta < d){
              index = i;
              d = delta;
            }
          }
          return index;
	},
	compare_rgb_exclude : function(sample, colors_rgb, exclude){
	  var index=undefined, d=195076, length=colors_rgb.length;
          for(var i=0; i<length; i++) if(exclude.indexOf(i)===-1){
          var delta = Math.pow(colors_rgb[i][0]-sample[0],2) + Math.pow(colors_rgb[i][1]-sample[1],2) + Math.pow(colors_rgb[i][2]-sample[2],2);
            if(delta < d){
              index = i;
              d = delta;
            }
          }
          return index;
	}

}