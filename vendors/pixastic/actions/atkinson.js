Pixastic.Actions.atkinson = {

	process : function(params) {
 
		if(Pixastic.Client.hasCanvasImageData()) {

                  var data = Pixastic.prepareData(params);
                  var rect = params.options.rect;
                  var w = rect.width;
                  var h = rect.height;
                  var w4 = w*4;
	
                  if(!params.options.color)
                    data = this.grayscale(data, params.options.grayscale);

                  data = this.dither_atkinson(data, w, params.options.color);            
                  return true;

		}

	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	},
        grayscale : function(data, grayscale){
    	  for(var i = 0; i <= data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = parseInt(data[i] * grayscale[0] + data[i + 1] * grayscale[1] + data[i + 2] * grayscale[2], 10);
	  }
	  return data;
        },
        dither_atkinson : function(data, imageWidth, drawColour){

	skipPixels = 4;

	if (!drawColour)
		drawColour = false;

	if(drawColour == true)
		skipPixels = 1;

	imageLength	= data.length;

	for (currentPixel = 0; currentPixel <= imageLength; currentPixel += skipPixels) {

		if (data[currentPixel] <= 128) {

			newPixelColour = 0;

		} else {

			newPixelColour = 255;

		}

		err = parseInt((data[currentPixel] - newPixelColour) / 8, 10);
		data[currentPixel] = newPixelColour;

		data[currentPixel + 4] += err;
		data[currentPixel + 8] += err;
		data[currentPixel + (4 * imageWidth) - 4]		+= err;
		data[currentPixel + (4 * imageWidth)]			+= err;
		data[currentPixel + (4 * imageWidth) + 4]		+= err;
		data[currentPixel + (8 * imageWidth)]			+= err;

		if (drawColour == false)
		  data[currentPixel + 1] = data[currentPixel + 2] = data[currentPixel];

	}

	return data;
       }

}