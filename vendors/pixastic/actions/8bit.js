/*
 *  based on http://mncaudill.github.com/3bitdither/ 
 *  by Nolan Caudill
 */

Pixastic.Actions['8bit'] = {

	process : function(params) {
 
		if(Pixastic.Client.hasCanvasImageData()) {

                  var data = Pixastic.prepareData(params);
                  var rect = params.options.rect;
                  var w = rect.width;
                  var h = rect.height;
                  var w4 = w*4;                

                  data = this.dither8Bit(data, w, h);            
                  return true;

		}

	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	},
        dither8Bit :  function (data, width, height) {

                size = 4;
                for (y = 0; y < height; y += size) {
                    for (x = 0; x < width; x += size) {

                        sum_r = 0;
                        sum_g = 0;
                        sum_b = 0;

                        for (s_y = 0; s_y < size; s_y++) {
                            for (s_x = 0; s_x < size; s_x++) {
                                i = 4 * (width * (y + s_y) + (x + s_x));

                                sum_r += data[i];
                                sum_g += data[i + 1];
                                sum_b += data[i + 2];
                            }
                        }

                        avg_r = (sum_r / (size * size)) > 127 ? 0xff : 00;
                        avg_g = (sum_g / (size * size)) > 127 ? 0xff : 00;
                        avg_b = (sum_b / (size * size)) > 127 ? 0xff : 00;

                        for (s_y = 0; s_y < size; s_y++) {
                            for (s_x = 0; s_x < size; s_x++) {
                                i = 4 * (width * (y + s_y) + (x + s_x));

                                data[i] = avg_r;
                                data[i + 1] = avg_g;
                                data[i + 2] = avg_b;
                            }
                        }
                    }
                }
             return data;
        }

}