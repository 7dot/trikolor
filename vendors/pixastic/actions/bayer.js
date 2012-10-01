Pixastic.Actions.bayer = {

	process : function(params) {
 
		if(Pixastic.Client.hasCanvasImageData()) {

                  var data = Pixastic.prepareData(params);
                  var rect = params.options.rect;
                  var w = rect.width;
                  var h = rect.height;
                  var w4 = w*4; 

                  if(!params.options.color)
                    data = this.grayscale(data, params.options.grayscale);               

                  data = this.ditherBayer(data, w, h, params.options.color, params.options.map);            
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
        ditherBayer :  function (data, width, height, drawColour, map) {

          var threshold_map ={
            '2' : [5,[
                    [1, 3],
                    [4, 2]
                 ]],
            '3' : [10,[
                    [3, 7, 4],
                    [6, 1, 9],
                    [2, 8, 5]
                 ]],
            '4' : [17,[
                    [1, 9, 3, 11 ],
                    [13, 5, 15, 7],
                    [4, 12, 2, 10],
                    [16, 8, 14, 6]
                 ]],
            '8' : [65,[
                    [ 1, 49, 13, 61,  4, 52, 16, 64 ],
                    [33, 17, 45, 29, 36, 20, 48, 32 ],
                    [ 9, 57,  5, 53, 12, 60,  8, 56 ],
                    [41, 25, 37, 21, 44, 28, 40, 24 ],
                    [ 3, 51, 15, 63,  2, 50, 14, 62 ],
                    [35, 19, 47, 31, 34, 18, 46, 30 ],
                    [11, 59,  7, 55, 10, 58,  6, 54 ],
                    [43, 27, 39, 23, 42, 26, 38, 22 ]
                 ]]
          };

                var k = threshold_map[map][0];
                var d = parseInt(map);

                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        i = 4 * (y * width + x);
                        b = threshold_map[map][1][ x%d ][ y%d ];

                        if(drawColour){
                          data[ i + 0 ] = ((data[ i + 0 ] * k) / 255) > b ? 255 : 0;
                          data[ i + 1 ] = ((data[ i + 1 ] * k) / 255) > b ? 255 : 0;
                          data[ i + 2 ] = ((data[ i + 2 ] * k) / 255) > b ? 255 : 0;
                        }else
                          data[i] = data[i + 1] = data[i + 2] = ((data[ i ] * k) / 255) > b ? 255 : 0; 

                    }
                }
		return data;
            }

}