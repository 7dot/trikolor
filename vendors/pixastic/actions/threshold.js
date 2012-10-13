/*
*  http://blog.inspirit.ru/?p=322
*/
Pixastic.Actions.threshold = {

	process : function(params) {
 
		if (Pixastic.Client.hasCanvasImageData()) {

			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;

                        var size = w * h;
                        var S = Math.floor( w/8 );
                        var S2 = Math.floor( S >> 1 );
                        var T = 0.15;
                        var IT = 1.0 - T;
                        var integral = new Array(size);
                        var threshold = new Array(size);
                        var data_ = new Array(size);

                        // grayscale
			var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;
					var r = data[offset];
					var g = data[offset+1];
					var b = data[offset+2];	
					var brightness = (r*params.options.grayscale[0] + g*params.options.grayscale[1] + b*params.options.grayscale[2])||0;
					r = g = b = Math.floor(brightness);		

					if (r < 0) r = 0; if (r > 255) r = 255;
					if (g < 0) g = 0; if (g > 255) g = 255;
					if (b < 0) b = 0; if (b > 255) b = 255;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

                                        var hex = parseInt("0x"+ ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1), 16);
                                        

                                        data_[(y-1)*w+(x-1)] = hex;

				} while (--x);
			} while (--y);

                        var i, j, diff;
                        var x1, y1, x2, y2, ind1, ind2, ind3;
                        var sum = 0;
                        var ind = 0;

                        while( ind < size ){
                          sum += data_[ind] & 0xFF;
                          integral[ind] = sum;
                          ind += w;
                        }

                	x1 = 0;
                	for( i = 1; i < w; ++i )
                	{
                		sum = 0;
                		ind = i;
                		ind3 = ind - S2;
                 
                		if( i > S ) x1 = i - S;
                		diff = i - x1;
                		for( j = 0; j < h; ++j )
                		{
                			sum += data_[ind] & 0xFF;
                			integral[ind] = integral[Math.floor(ind-1)] + sum;
                			ind += w;
                 
                			if(i < S2) continue;
                			if(j < S2) continue;
                 
                			y1 = (j < S ? 0 : j - S);
                 
                			ind1 = y1 * w;
                			ind2 = j * w;
                 
                			if (((data_[ind3]&0xFF)*(diff * (j - y1))) < ((integral[Math.floor(ind2 + i)] - integral[Math.floor(ind1 + i)] - integral[Math.floor(ind2 + x1)] + integral[Math.floor(ind1 + x1)])*IT))
                			{
                				threshold[ind3] = 0x00;
                			} else {
                				threshold[ind3] = 0xFFFFFF;
                			}
                			ind3 += w;
                		}
                	}
                 
                	y1 = 0;
                	for( j = 0; j < h; ++j )
                	{
                		i = 0;
                		y2 = h - 1;
                		if( j < h - S2 ) 
                		{
                			i = w - S2;
                			y2 = j + S2;
                		}
                 
                		ind = j * w + i;
                		if( j > S2 ) y1 = j - S2;
                		ind1 = y1 * w;
                		ind2 = y2 * w;
                		diff = y2 - y1;
                		for( ; i < w; ++i, ++ind )
                		{
                 
                			x1 = ( i < S2 ? 0 : i - S2);
                			x2 = i + S2;
                 
                			// check the border
                			if (x2 >= w) x2 = w - 1;
                 
                			if (((data_[ind]&0xFF)*((x2 - x1) * diff)) < ((integral[Math.floor(ind2 + x2)] - integral[Math.floor(ind1 + x2)] - integral[Math.floor(ind2 + x1)] + integral[Math.floor(ind1 + x1)])*IT))
                			{
                				threshold[ind] = 0x00;
                			} else {
                				threshold[ind] = 0xFFFFFF;
                			}
                		}
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
                                        var hex = threshold[(y-1)*w+(x-1)];	
					var brightness = (hex >> 16)&255;
					r = g = b = brightness;		

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