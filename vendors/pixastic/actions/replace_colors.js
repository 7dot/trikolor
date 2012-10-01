Pixastic.Actions.replace_colors = {

	process : function(params) {
                var colors = [];
                for(var i in params.options.colors){
                  var color_src = params.options.colors[i][0].match(/rgb\((\d+),(\d+),(\d+)\)/);
                  var color_dest = params.options.colors[i][1].match(/rgb\((\d+),(\d+),(\d+)\)/);
                  colors.push([[color_src[1],color_src[2],color_src[3]],[color_dest[1],color_dest[2],color_dest[3]]]);
                }

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;

			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;
                                        var r = data[offset];
                                        var g = data[offset+1];                      
                                        var b = data[offset+2]; 

                                        for(var i in colors){                                        
                                          if(colors[i][0][0]==r && colors[i][0][1]==g && colors[i][0][2]==b){
                                            r = colors[i][1][0];
                                            g = colors[i][1][1];
                                            b = colors[i][1][2];
                                            break;
                                          }
                                        }
                               
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
	}
}