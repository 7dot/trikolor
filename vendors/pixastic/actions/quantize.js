Pixastic.Actions.quantize = {

	process : function(params) {

		
		var numLevels = 64;
		if (typeof params.options.levels != "undefined")
			numLevels = parseInt(params.options.levels,10)||2;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);

			numLevels = Math.max(2,Math.min(64,numLevels));
	

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;

                        var maxColors = numLevels;
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

					if (r > 255) r = 255;
					if (g > 255) g = 255;
					if (b > 255) b = 255;

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


