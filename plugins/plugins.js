var plugins = [{ "path" : "source/file",
  "name"       : "Open image",
  "options"    : { "filedata" : "" },
  "html"       : "<input type=\"file\" class=\"filter-file\" accept=\"image/*\" autocomplete=\"off\" /><br><div class=\"filter-preview\"></div>",
  "init"    : function(element,options){
                var index = element.data('index');
                var reader = new FileReader();
                reader.onload = function(e){
                  config.plugins[index].options.filedata = e.target.result;   
                  result_update(index);
                };

                element
                .find('.filter-file')
                .change(function(e){
                   reader.readAsDataURL(e.target.files[0]);                  
                });

                element
                .find('.filter-preview')
                .html( options.filedata? '<img style="width: 48px; height: auto;" src="'+options.filedata+'">' :'' );
  
              },
  "prefilter"  : function(div, options, class_out, callback){
                   if(options.filedata)
                     result_image(div, options.filedata, 'new', class_out, callback);
                   else callback();
                 }
},{ "path" : "source/local",
  "name"       : "Load local images",
  "options"    : { "mask" : "image_{$}.png", "amount" : "1" },
  "html"       : "Path - /images/<br>Filename pattern: <input type=\"text\" class=\"filter-mask\"><br>({$} - 1 to Amount)<br>Amount: <input type=\"text\" class=\"filter-amount\" size=\"3\">",
  "init"    : function(element,options){
                var index = element.data('index');
                element
                .find('.filter-mask')
                .val(options.mask)
                .change(function(){
                  config.plugins[index].options.mask = $(this).val();
                  result_update(index);
                }).end()                
                .find('.filter-amount')
                .val(options.amount)
                .change(function(){ 
                  config.plugins[index].options.amount = $(this).val();
                  result_update(index);
                });  
              },
  "prefilter"  : function(div, options, class_out, callback){
                   this.urls = [];
                   for(var i=1; i<=options.amount; i++)
                     this.urls.push(options.mask.replace('{$}',i));

                   img_count = this.urls.length;
                   this.last_url_index = img_count - 1;                                                       
                   if(img_count) this.prefilter_load(div, class_out, callback, 0); 
                 }, 
  "prefilter_load" : function(div, class_out, callback, index){
                       if(state.status=='wait') return;
                       var obj = this;  
                       $("#progressbar").progressbar("option", "value", index*100/img_count );
                       if(index == obj.last_url_index) 
                         result_image(div, 'images/'+obj.urls[index], 'new', class_out, callback);
                       else                                             
                         result_image(div, 'images/'+obj.urls[index], 'new', class_out, function(){
                           obj.prefilter_load(div, class_out, callback, ++index); 
                         });                        
                     }
},{ "path" : "source/new",
  "name"    : "New image",
  "options" : { 
                "background" : "rgb(0,0,0)",
                "width"      : 48,
                "height"     : 48  
              },
  "html"    : "Background: <input type=\"text\" class=\"filter-background\"><br>Width: <input type=\"text\" class=\"filter-width\"><br>Height: <input type=\"text\" class=\"filter-height\">",
  "init"    : function(element,options){
                var index = element.data('index');
                element.find('.filter-background')
                .val(options.background)
                .change(function(){ 
                  config.plugins[index].options.background = $(this).val();
                  result_update(index);
                });
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
  "prefilter"  : function(div, options, class_out, callback){
                   
                   var background = options.background || this.options.background;
                   var width = options.width || this.options.width;
                   var height = options.height || this.options.height;

                   var canvas, ctx;
                   canvas = document.createElement("canvas");
                   ctx = canvas.getContext("2d");
                   canvas.width = width;
                   canvas.height = height;
                   ctx.fillStyle = background;
                   ctx.fillRect(0, 0, width, height);

                   result_image(div, canvas.toDataURL("image/png"), 'new', class_out, callback);
                 }
},{ "path" : "source/url",
  "name"    : "Download images by URLs (server)",
  "options" : { "urls" : "" },
  "html"    : "URLs (one per line)<br><textarea autocomplete=\"off\" class=\"filter-urls\" style=\"width: 98%;\"></textarea>",
  "init"    : function(element,options){
                var index = element.data('index');
                element.find('.filter-urls')
                .val(options.urls)
                .change(function(){ 
                  config.plugins[index].options.urls = $(this).val();
                  result_update(index);
                }); 
              },
  "prefilter"  : function(div, options, class_out, callback){
                   if(!options.urls) return callback();
                   this.urls = options.urls.split("\n");
                   img_count = this.urls.length;
                   this.last_url_index = img_count-1;                                                       
                   this.prefilter_load(div, class_out, callback, 0); 
                 }, 
  "prefilter_load" : function(div, class_out, callback, index){
                       if(state.status=='wait') return;
                       var obj = this;
                       $("#progressbar").progressbar("option", "value", index*100/img_count );
                       var url = proxy + encodeURIComponent(obj.urls[index]);
                       if(index == obj.last_url_index) 
                         result_image(div, url, 'new', class_out, callback);
                       else                                             
                         result_image(div, url, 'new', class_out, function(){
                           obj.prefilter_load(div, class_out, callback, ++index); 
                         });                        
                     }
},{ "path" : "source/google",
  "name"       : "search with images.google.com (server)",
  "options"    : {
                   "google"   : "http://ajax.googleapis.com/ajax/services/search/images?v=1.0&callback=GoogleCallback&context=?",
                   "query"    : "",
                   "safe"     : "off",
                   "imgcolor" : "",
                   "imgsz"    : "",
                   "imgtype"  : "",
                   "amount"   : "8",
                   "result"   : "tbUrl"
                 },
  "dynamic"    : [
                   ["result",   "Image source:"                  ],
                   ["imgcolor", "Image color:"                   ],
                   ["imgsz",    "Image size:"                    ],
                   ["imgtype",  "Image type:"                    ]
                 ],
  "params"     : {
                   "result"   : [
                                  ["tbUrl", "Preview"   ],
                                  ["url",   "Original"  ]
                                ],
                   "imgcolor" : [
                                  ["",       "All"       ],
                                  ["black",  "<span style=\"background-color: black; color: white;\">&nbsp;black&nbsp;</span>"  ],
                                  ["blue",   "<span style=\"background-color: blue; color: white;\">&nbsp;blue&nbsp;</span>"   ],
                                  ["brown",  "<span style=\"background-color: brown; color: white;\">&nbsp;brown&nbsp;</span>"  ],
                                  ["gray",   "<span style=\"background-color: gray; color: white;\">&nbsp;gray&nbsp;</span>"   ],
                                  ["green",  "<span style=\"background-color: green; color: white;\">&nbsp;green&nbsp;</span>"  ],
                                  ["orange", "<span style=\"background-color: orange; color: black;\">&nbsp;orange&nbsp;</span>" ],
                                  ["pink",   "<span style=\"background-color: pink; color: black;\">&nbsp;pink&nbsp;</span>"   ],
                                  ["purple", "<span style=\"background-color: purple; color: white;\">&nbsp;purple&nbsp;</span>" ],
                                  ["red",    "<span style=\"background-color: red; color: white;\">&nbsp;red&nbsp;</span>"    ],
                                  ["teal",   "<span style=\"background-color: teal; color: white;\">&nbsp;teal&nbsp;</span>"   ],
                                  ["white",  "<span style=\"background-color: white; color: black;\">&nbsp;white&nbsp;</span>"  ],
                                  ["yellow", "<span style=\"background-color: yellow; color: black;\">&nbsp;yellow&nbsp;</span>" ] 
                                ],
                   "imgsz"    : [
                                  ["",        "All"      ],
                                  ["icon",    "Icon"     ],
                                  ["medium",  "Medium"   ],
                                  ["xxlarge", "Large"    ],
                                  ["huge",    "Huge"     ]
                                ],
                   "imgtype"  : [
                                  ["",        "All"         ],
                                  ["face",    "Face"        ],
                                  ["photo",   "Photo"       ],
                                  ["clipart", "Clipart"     ],
                                  ["lineart", "Lineart"     ]
                                ]
                 },
  "html"       : "Search: <input class=\"filter-query\" size=\"40\" type=\"text\"><br>"+
                 "Amount (1-64): <span class=\"filter-amount\"></span><div class=\"filter-amount-slider\"></div>"+
                 "<div class=\"filter-dynamic\"></div>",
  "init"       : function(element,options){
                   if(!(window['GoogleCallback'] instanceof Function))
                     window.GoogleCallback = function(func, data){ window[func](data); };

                   var index = element.data('index');
                   var obj = this;
                   obj.id = Math.floor(Math.random()*10000);

                   element.find('.filter-amount-slider').slider({
                     value: options.amount,
                     orientation: "horizontal",
                     range: "min",
                     min: 1,
                     max: 64,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-amount').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.amount = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-amount').text(options.amount);

                   var dynamic = element.find('.filter-dynamic');

                   for(var i in obj.dynamic){
                     var option = obj.dynamic[i][0];
                     var param = $('<div>'+obj.dynamic[i][1]+'<div class="filter-radio"></div></div>')
                     .appendTo(dynamic);
                     var radio = param.find('.filter-radio');
                     
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

                   element.find('.filter-query')
                   .val(options.query)
                   .change(function(){ 
                     config.plugins[index].options.query = $(this).val();
                     result_update(index);
                   });
                 },
  "prefilter"  : function(div, options, class_out, callback){

                   if(!options.query) return callback();

                   var obj = this;
                   obj.urls = [];

                   var param = {
                     "q"        : options.query,
                     "safe"     : options.safe,
                     "imgcolor" : options.imgcolor,
                     "imgsz"    : options.imgsz,
                     "imgtype"  : options.imgtype,
                   };

                   var plan=obj.get_plan(options.amount);
                   obj.query(param, plan, options.result, options.google, 0, function(){ 
                     if(!obj.urls) return callback();
                     img_count = obj.urls.length;
                     obj.last_url_index = img_count - 1;
                     obj.prefilter_load(div, class_out, callback, 0);
                   });

                 },
  "get_plan"   : function(n){
                   if(n>64) n = 64;
                   else if(n<1) n=1;  
                   var plan = []; 
                   for(var i=0; i<n; i=i+8)
                     plan.push({"rsz": ((i+8)>n? n%8 : 8), "start":i});
                   return plan;
                 },
  "query"      : function(param, plan, imgresult, url, index, callback){

                   var obj = this;

                   param.rsz = plan[index].rsz;
                   param.start = plan[index].start;

                   $.getJSON(url, param, function(data){
                     $.each(data.results, function(key, value){ obj.urls.push(value[imgresult]); });
                     if(++index < plan.length && data.cursor.pages[index]) 
                       obj.query(param, plan, imgresult, url, index, callback);
                     else callback();
                   });
                 },
  "prefilter_load" : function(div, class_out, callback, index){
                       if(state.status=='wait') return;
                       var obj = this;
                       $("#progressbar").progressbar("option", "value", index*100/img_count );
                       var url = proxy + encodeURIComponent(obj.urls[index]);
                       if(index == obj.last_url_index) 
                         result_image(div, url, 'new', class_out, callback);
                       else                                             
                         result_image(div, url, 'new', class_out, function(){
                           obj.prefilter_load(div, class_out, callback, ++index); 
                         });                        
                     }
},{ "path" : "source/parser",
  "name"    : "Image parser (server)",
  "options" : { "page" : "", "mask" : "img[^>]+?src\\s*=\\s*(['\"])([^\\1]+?)\\1" },
  "html"    : "Load image from web page (only absolute links)<br>URL:<br><input type=\"text\" class=\"filter-page\" style=\"width: 98%;\"><br>Regexp pattern:<br><input type=\"text\" class=\"filter-mask\" style=\"width: 98%;\">",
  "init"    : function(element,options){
                var index = element.data('index');
                element.find('.filter-page')
                .val(options.page)
                .change(function(){ 
                  config.plugins[index].options.page = $(this).val();
                  result_update(index);
                }); 
                element.find('.filter-mask')
                .val(options.mask)
                .change(function(){ 
                  config.plugins[index].options.mask = $(this).val();
                  result_update(index);
                }); 
              },
  "prefilter"  : function(div, options, class_out, callback){

                   if(!options.page || !options.mask) return callback();
                   var obj = this;
                   $.get(proxy+encodeURIComponent(options.page), function(data){
                     var base = options.page.substring(0,options.page.lastIndexOf('/'));
                     var pattern = new RegExp(options.mask,'gim');
                     var imgs = data.match(pattern); 
                     pattern = new RegExp(options.mask,'im');
                     obj.urls=[];

                     // todo - + base tag & relative links
                     // todo - + links with / ../

                     for(var i in imgs){
                       var temp = imgs[i].match(pattern);
                       if(temp[2] && temp[2].indexOf('http')===0) obj.urls.push(temp[2]);
                       else obj.urls.push(base + (temp[2].charAt(0)=='/'?'':'/') + temp[2])
                     };

                     if(obj.urls.length){
                       img_count = obj.urls.length;
                       obj.last_url_index = img_count - 1;
                       obj.prefilter_load(div, class_out, callback, 0);
                     }

                   },'html');
            
                 }, 
  "prefilter_load" : function(div, class_out, callback, index){
                       if(state.status=='wait') return;
                       var obj = this;
                       $("#progressbar").progressbar("option", "value", index*100/img_count );
                       var url = proxy + encodeURIComponent(obj.urls[index]);
                       if(index == obj.last_url_index) 
                         result_image(div, url, 'new', class_out, callback);
                       else                                             
                         result_image(div, url, 'new', class_out, function(){
                           obj.prefilter_load(div, class_out, callback, ++index); 
                         }); 
                       
                     }
},{ "path" : "source/upload",
  "name"    : "Upload image (server)",
  "load"    : ['vendors/ajaxfileupload.js'],
  "options" : { 
                "upload" : "server/upload.php?action=upload",
                "delete" : "server/upload.php?action=delete",
                "update" : "server/upload.php?action=update",  
              },
  "html"    : "<input class=\"filter-file\" type=\"file\" name=\"file\" accept=\"image/*\"><br>Uploaded images:<br><div class=\"filter-images\"></div>",
  "init"    : function(element,options){
                var obj = this;
                this.update(element);

                element.find('.filter-file').change(function(){
                  $.ajaxFileUpload({
                      url: obj.options.upload,
                      secureuri:false,
                      fileElementId: $(this),
                      dataType: 'json',
                      success: function(data,status){ 
                        obj.update(element); 
                        result_update(element.data('index'));
                      }
                  });
                });
                
 
              },
  "update"  : function(element){
                var obj = this;
                $.getJSON(obj.options.update, function(data){
                  var div = element.find('.filter-images').empty();
                  $.each(data, function(key,value){
                    div.append('<span>'+value+'</span> <a href="#">delete</a><br>');
                  })
                  div.find('a').click(function(e){
                    e.preventDefault();
                    $.get(obj.options.delete, {"img":$(this).prev().text()}, function(){
                      obj.update(element);
                      result_update(element.data('index'));
                    });
                  });
                });   
              }
},{ "path" : "graphics/editor",
  "name"       : "Pixel Editor",
  "options"    : { "width_limit" : 50, "height_limit" : 50 },
  "load"       : [
                   'vendors/pixie/stylesheets/pixie.css',
                   'vendors/pixie/javascripts/jqcolor.js',
                   'vendors/pixie/javascripts/jquery.hotkeys-0.7.9.min.js',
                   'vendors/pixie/javascripts/pixie.js'
                  ],
  "html"       : "Limitations: width <= 50 px, height <= 50 px, palette <= 256 colors",
  "filter"     : function(image, options, class_out, callback){
                   var div = $('<div title="Pixel Editor"></div>')
                   .appendTo('body');

                   $('<img>')
                   .appendTo('body')
                   .prop('src',image.prop('src'))
                   .load(function(){
                     var width  = $(this).width();
                     var height = $(this).height();
                     
                     if(width>options.width_limit || height>options.height_limit){
                       callback();
                       $(this).remove();
                       return;
                     } 
                 
                     var canvas, ctx;
                     canvas = document.createElement("canvas");
                     ctx = canvas.getContext("2d");
                     canvas.width = width;
                     canvas.height = height;
                     ctx.drawImage($(this).get(0), 0, 0);
                     var imgd = ctx.getImageData(0, 0, width, height);
                     var pix = imgd.data;

                     var editor = $('<div class="filter-editor"></div>')
                     .pixie({
                       width: width,
                       height: height,
                       initializer: function(canvas) {

                         var pixels = [];
                         for (var i = 0, n = pix.length; i < n; i += 4)
                         pixels.push('#' + 
                           canvas.toHex(pix[i  ]) +
                           canvas.toHex(pix[i+1]) +
                           canvas.toHex(pix[i+2])
                         );

                         canvas.addAction({
                           name: "Reset",
                           perform: function(canvas){ 
                             var i = 0;
                             canvas.eachPixel(function() {
                               this.css("backgroundColor", pixels[i++]);
                             }); 
                           }
                         });

                         canvas.addAction({
                           name: "Save",
                           perform: function(canvas){ 
                             result_image(image, canvas.toDataURL_("image/png"), null, class_out, function(){ 
                                                           div.dialog( "close" );
                                                         }); 
                           }
                         });

                         var i = 0;
                           canvas.eachPixel(function() {
                           this.css("backgroundColor", pixels[i++]);
             });
              
                       }
                     })
                     .appendTo(div);                 

                     $(this).remove();

                     div.dialog({
                       modal: true,
                       width: 'auto',
                       height: 'auto',
                       close: function(){ callback(); },
                       // open: function(){  }
                     });

                   });
    
                 }
},{ "path" : "graphics/crop",
  "name"       : "Crop",
  "load"       : [
                   'vendors/tapmodo-Jcrop/css/jquery.Jcrop.min.css',
                   'vendors/tapmodo-Jcrop/js/jquery.Jcrop.min.js',
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/crop.js' 
                  ],
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   var div = $('<div title="Crop"></div>').appendTo('body');
                   var coords = null;
                   var jcrop_api;

                   var img = $('<img>')
                   .appendTo(div)
                   .prop('src',image.prop('src'))
                   .load(function(){

                     div.dialog({
                       modal:   true,
                       width:   'auto',
                       height:  'auto',
                       buttons: {
				  "Crop": function() {
                                                jcrop_api.destroy();
                                                if(coords){
                                                  var class_out =  class_out == '*' ? image.data('class') : class_out;
                                                  img
                                                  .pixastic('crop', {
		                                                        rect : {
			                                                          left : coords.x, 
                                                                                  top : coords.y, 
                                                                                  width : coords.w, 
                                                                                  height : coords.h
		                                                               }
	                                                             }, 
                                                     function(res){
                                                         result_image(image, res.toDataURL("image/png"), null, class_out, function(){ 
                                                           div.dialog( "close" );
                                                         });
                                                  });
                                                }
				              },
				  "Cancel"   : function() {
					         div.dialog( "close" );
				               }
			        },
                       close:   function(){ div.remove(); callback(); },
                       open:    function(){
                                  img.Jcrop({
                                    onSelect : function(c){ coords = c; },
                                    onChange : function(c){ coords = c; },
                                    onRelease: function(c){ coords = null; }
                                  },function(){ jcrop_api = this; });
                                }
                     });

                   });
    
                 }
},{ "path" : "graphics/resize",
  "name"       : "Resize",
  "options"    : {
                   "image_width"   : "",
                   "image_height"  : "",
                   "ratio"         : "none",
                   "canvas_width"  : "",
                   "canvas_height" : "",
                   "scale"         : "none",
                   "background"    : "rgb(255,255,255)",
                   "anchor"        : "lt"
                 },
  "dynamic"    : ["ratio", "scale", "anchor"],
  "params"       : {
                   "ratio"  : [["none","none"], ["width", "by width"], ["height", "by height"]],
                   "scale"  : [["none","none"], ["crop","crop"], ["background","add background"]],
                   "anchor" : [["lt","<span class=\"ui-icon ui-icon-carat-1-nw\"></span>"],
                               ["ct","<span class=\"ui-icon ui-icon-carat-1-n\"></span>"],
                               ["rt","<span class=\"ui-icon ui-icon-carat-1-ne\"></span>"],
                               ["lm","<span class=\"ui-icon ui-icon-carat-1-w\"></span>"],
                               ["cm","<span class=\"ui-icon ui-icon-radio-on\"></span>"],
                               ["rm","<span class=\"ui-icon ui-icon-carat-1-e\"></span>"],
                               ["lb","<span class=\"ui-icon ui-icon-carat-1-sw\"></span>"],
                               ["cb","<span class=\"ui-icon ui-icon-carat-1-s\"></span>"],
                               ["rb","<span class=\"ui-icon ui-icon-carat-1-se\"></span>"]],
                  },
  "html"       : "<fieldset><legend>Image:</legend>original if empty"+
                 "<br>Width: <input size=\"4\" type=\"text\" class=\"filter-image-width\">"+
                 " Height: <input size=\"4\" type=\"text\" class=\"filter-image-height\">"+
                 "<br>Ratio: <div class=\"filter-ratio\"></div>"+
                 "</fieldset>"+
                 "<fieldset><legend>Canvas:</legend>image options if empty"+
                 "<br>Width: <input size=\"4\" type=\"text\" class=\"filter-canvas-width\">"+
                 " Heigth: <input size=\"4\" type=\"text\" class=\"filter-canvas-height\">"+
                 "<br>Background: <input size=\"16\" type=\"text\" class=\"filter-background\">"+
                 "<br>Scale: <div class=\"filter-scale\"></div>"+
                 "Anchor: <div class=\"filter-anchor\"></div>"+
                 "</fieldset>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   var obj = this;
                   obj.id = Math.floor(Math.random()*10000);

                   element.find('.filter-image-width')
                   .val(options.image_width)
                   .change(function(){ 
                     config.plugins[index].options.image_width = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-image-height')
                   .val(options.image_height)
                   .change(function(){ 
                     config.plugins[index].options.image_height = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-canvas-width')
                   .val(options.canvas_width)
                   .change(function(){ 
                     config.plugins[index].options.canvas_width = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-canvas-height')
                   .val(options.canvas_height)
                   .change(function(){ 
                     config.plugins[index].options.canvas_height = $(this).val();
                     result_update(index);
                   });

                   element.find('.filter-background')
                   .val(options.background)
                   .change(function(){ 
                     config.plugins[index].options.background = $(this).val();
                     result_update(index);
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
                   var anchors = element.find('.filter-anchor > label');
                   anchors.eq(0).removeClass('ui-corner-left').addClass('ui-corner-tl');
                   anchors.eq(2).addClass('ui-corner-tr').after('<br>');
                   anchors.eq(5).after('<br>');
                   anchors.eq(6).addClass('ui-corner-bl');
                   anchors.eq(8).removeClass('ui-corner-right').addClass('ui-corner-br');

                 },
  "filter"     : function(image, options, class_out, callback){
                   
                   image
                   .css('width','auto');

                   var width_original = image.width();
                   var height_original = image.height();

                   var width, height;

                   switch(options.ratio){
                     case 'none':
                        width = options.image_width || width_original;
                        height = options.image_height || height_original;  
                       break;
                     case 'width':
                        width = options.image_width || width_original;
                        height = width * height_original / width_original;  
                       break;
                     case 'height':
                        height = options.image_height || height_original;
                        width = height * width_original / height_original;  
                       break;
                   }

                   width  = Math.floor(width);
                   height = Math.floor(height);

                   var canvas_, ctx_;
                   canvas_ = document.createElement("canvas");
                   ctx_ = canvas_.getContext("2d");
                   canvas_.width = width;
                   canvas_.height = height;
                   ctx_.drawImage(image.get(0), 0, 0, width_original, height_original, 0, 0, width, height);

                   var canvas, ctx;
                   canvas = document.createElement("canvas");
                   ctx = canvas.getContext("2d");
                   canvas.width = options.canvas_width || width;
                   canvas.height = options.canvas_height || height;
                     
                   ctx.fillStyle = options.background;
                   ctx.fillRect(0, 0, canvas.width, canvas.height);

                   var sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight;

                   switch(options.scale){
                     case 'none':
                       if(width > canvas.width){ 
                         sWidth = canvas.width;
                         dWidth = canvas.width;
                         if(options.anchor.charAt(0)=='l') sx = 0;
                         else if(options.anchor.charAt(0)=='c') sx = (width - canvas.width) / 2;
                         else sx = width - canvas.width;
                         dx = 0;
                       }else{
                         sWidth = width;
                         dWidth = width;
                         sx = 0;
                         if(options.anchor.charAt(0)=='l') dx = 0;
                         else if(options.anchor.charAt(0)=='c') dx = (canvas.width - width) / 2;
                         else dx = canvas.width - width;
                       }

                       if(height > canvas.height){ 
                         sHeight = canvas.height;
                         dHeight = canvas.height;
                         if(options.anchor.charAt(1)=='t') sy = 0;
                         else if(options.anchor.charAt(1)=='m') sy = (height - canvas.height) / 2;
                         else sy = height - canvas.height;
                         dy = 0;
                       }else{
                         sHeight = height;
                         dHeight = height;
                         sy = 0;
                         if(options.anchor.charAt(1)=='t') dy = 0;
                         else if(options.anchor.charAt(1)=='m') dy = (canvas.height - height) / 2;
                         else dy = canvas.height - height;
                       }   
                       break;
                     case 'crop':
                         var image_ratio = width / height;
                         var canvas_ratio = canvas.width / canvas.height;
                         if(image_ratio*canvas.height > canvas.width){
                           sHeight = height;
                           sWidth  = height * canvas_ratio;
                           dWidth = canvas.width;
                           dHeight = canvas.height;
                           if(options.anchor.charAt(0)=='c') sx = (width - sWidth) / 2;
                           else if(options.anchor.charAt(0)=='r') sx = width - sWidth;
                           else sx = 0; 
                           sy = 0;
                           dx = 0;
                           dy = 0;
                         }else{
                           sHeight = width / canvas_ratio;
                           sWidth  = width;
                           dWidth = canvas.width;
                           dHeight = canvas.height;
                           sx = 0;
                           if(options.anchor.charAt(1)=='m') sy = (height - sHeight) / 2;
                           else if(options.anchor.charAt(1)=='b') sy = height - sHeight;
                           else sy = 0; 
                           dx = 0;
                           dy = 0;
                         }
                       break;
                     case 'background':
                         var image_ratio = width / height;
                         var canvas_ratio = canvas.width / canvas.height;
                         if(image_ratio*canvas.height > canvas.width){
                           sHeight = height;
                           sWidth  = width;
                           dWidth = canvas.width;
                           dHeight = canvas.width / image_ratio;
                           sx = 0;
                           sy = 0;
                           dx = 0;
                           if(options.anchor.charAt(1)=='m') dy = (canvas.height - dHeight) / 2;
                           else if(options.anchor.charAt(1)=='b') dy = canvas.height - dHeight;
                           else dy = 0; 
                         }else{
                           sHeight = height;
                           sWidth  = width;
                           dWidth = canvas.height *  image_ratio;
                           dHeight = canvas.height;
                           sx = 0;
                           sy = 0;
                           if(options.anchor.charAt(0)=='c') dx = (canvas.width - dWidth) / 2;
                           else if(options.anchor.charAt(0)=='r') dx = canvas.width - dWidth;
                           else dx = 0;
                           dy = 0;
                         }  
                       break;
                   }

                   // console.log("sx - "+sx+"; sy - "+sy+"; sWidth - "+sWidth+"; sHeight - "+sHeight+"; dx - "+dx+"; dy - "+dy+"; dWidth - "+dWidth+"; dHeight - "+dHeight);

                   ctx.drawImage(canvas_, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

                   result_image(image, canvas.toDataURL("image/png"), null, class_out, callback);
                 }
},{ "path" : "graphics/rotate",
  "name"       : "Rotate",
  "options"    : {"angle" : 0 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/rotate.js'  
                 ],
  "html"       : "Angle: <span class=\"filter-angle\"></span><div class=\"filter-angle-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-angle-slider').slider({
                     value: options.angle,
                     orientation: "horizontal",
                     range: "min",
                     min: -180,
                     max: 180,
                     step: 1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-angle').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.angle = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-angle').text(options.angle);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('rotate', {"angle" : options.angle}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/lighten",
  "name"       : "Lighten",
  "options"    : {"amount" : 0.5 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/lighten.js'  
                 ],
  "html"       : "Lightness: <span class=\"filter-amount\"></span><div class=\"filter-amount-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-amount-slider').slider({
                     value: options.amount,
                     orientation: "horizontal",
                     range: "min",
                     min: -1,
                     max: 1,
                     step: 0.01,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-amount').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.amount = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-amount').text(options.amount);

                 },
  "filter"     : function(image, options, class_out, callback){
                   if(options.amount == 0) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('lighten', {"amount" : options.amount}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/invert",
  "name"       : "Invert",
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/invert.js'  
                 ],
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('invert', null, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/remove_noise",
  "name"       : "Remove noise",
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/removenoise.js'  
                 ],
  "html"       : "",
   "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('removenoise', null, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/edges",
  "name"       : "Edge Detection",
  "options"    : {
                   "mono"     : false,
                   "invert"   : false
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/edges.js'  
                 ],
  "html"       : "<div class=\"filter-mono-div\"></div>" + 
                 "<div class=\"filter-invert-div\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   $('<input id="filter-edges-mono-'+this.id+'" class="filter-mono" type="checkbox" '+ (options.mono? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-mono-div'))
                   .after('<label for="filter-edges-mono-'+this.id+'">Mono</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.mono = $(this).is(':checked');
                     result_update(index);                      
                   });

                   $('<input id="filter-edges-invert-'+this.id+'" class="filter-invert" type="checkbox" '+ (options.invert? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-invert-div'))
                   .after('<label for="filter-edges-invert-'+this.id+'">Invert</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.invert = $(this).is(':checked');
                     result_update(index);                      
                   });

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('edges', {"invert" : options.invert, "mono" : options.mono}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/edges_laplace",
  "name"       : "Laplace Edge Detection",
  "options"    : {                  
                   "invert"       : true,
                   "greyLevel"    : 0,   // 0 - 255
                   "edgeStrength" : 5    // 0 - ?
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/laplace.js'  
                 ],
  "html"       : "Grey level: <span class=\"filter-greyLevel\"></span>%<div class=\"filter-greyLevel-slider\"></div>" + 
                 "Edge strength: <span class=\"filter-edgeStrength\"></span>%<div class=\"filter-edgeStrength-slider\"></div>" + 
                 "<div class=\"filter-invert-div\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-greyLevel-slider').slider({
                     value: options.greyLevel,
                     orientation: "horizontal",
                     range: "min",
                     min: 0,
                     max: 255,
                     step: 1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-greyLevel').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.greyLevel = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-greyLevel').text(options.greyLevel);

                   element.find('.filter-edgeStrength-slider').slider({
                     value: options.edgeStrength,
                     orientation: "horizontal",
                     range: "min",
                     min: 0,
                     max: 50,
                     step: 0.1,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-edgeStrength').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.edgeStrength = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-edgeStrength').text(options.edgeStrength);

                   $('<input id="filter-edges-invert-'+this.id+'" class="filter-invert" type="checkbox" '+ (options.invert? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-invert-div'))
                   .after('<label for="filter-edges-invert-'+this.id+'">Invert</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.invert = $(this).is(':checked');
                     result_update(index);                      
                   });

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('laplace', {"invert" : options.invert, "greyLevel" : options.greyLevel, "edgeStrength" : options.edgeStrength}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/mosaic",
  "name"       : "Mosaic",
  "options"    : {"blocksize" : 5 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/mosaic.js'  
                 ],
  "html"       : "Block size: <span class=\"filter-blocksize\"></span><div class=\"filter-blocksize-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');

                   element.find('.filter-blocksize-slider').slider({
                     value: options.blocksize,
                     orientation: "horizontal",
                     range: "min",
                     min: 2,
                     max: 10,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-blocksize').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.blocksize = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-blocksize').text(options.blocksize);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('mosaic', {"blockSize" : options.blocksize}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/posterize",
  "name"       : "Posterize",
  "options"    : {"levels" : 3 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/posterize.js'  
                 ],
  "html"       : "Levels: <span class=\"filter-levels\"></span><div class=\"filter-levels-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');

                   element.find('.filter-levels-slider').slider({
                     value: options.levels,
                     orientation: "horizontal",
                     range: "min",
                     min: 2,
                     max: 256,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-levels').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.levels = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-levels').text(options.levels);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('posterize', {"levels" : options.levels}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/quantize",
  "name"       : "Quantize",
  "options"    : {"levels" : 3 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/quantize.js',
                   'vendors/pixastic/actions/quantize.js'  
                 ],
  "html"       : "Number of colors: <span class=\"filter-levels\"></span><div class=\"filter-levels-slider\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');

                   element.find('.filter-levels-slider').slider({
                     value: options.levels,
                     orientation: "horizontal",
                     range: "min",
                     min: 2,
                     max: 64,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-levels').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.levels = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-levels').text(options.levels);

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('quantize', {"levels" : options.levels}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/8bit",
  "name"       : "Dithering 8bit",
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/8bit.js'  
                 ],
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('8bit', null, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/halftone",
  "name"       : "Dithering Halftone",
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/halftone.js'  
                 ],
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('halftone', null, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/atkinson",
  "name"       : "Dithering Atkinson",
  "options"    : { 
                   "color"     : true,
                   "grayscale" : [0.299, 0.587, 0.114]   // [0.212, 0.715, 0.0722]
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/atkinson.js'  
                 ],
  "html"       : "<div class=\"filter-color-div\"></div>",
  "init"       : function(element, options){

                  var div = element.find('.filter-colors');
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  $('<input id="filter-atkinson-color-'+obj.id+'" class="filter-color" type="checkbox" '+ (options.color? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-color-div'))
                   .after('<label for="filter-atkinson-color-'+obj.id+'">Color</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.color = $(this).is(':checked');
                     result_update(index);                      
                   });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('atkinson', { "color" : options.color,"grayscale": options.grayscale }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/bayer",
  "name"       : "Dithering Bayer",
  "options"    : { 
                   "color"     : true,
                   "map"       : "4",
                   "grayscale" : [0.299, 0.587, 0.114]   // [0.212, 0.715, 0.0722]
                 },
  "dynamic"    : ["map"],
  "params"       : {
                    "map"  : [["2","2x2"], ["3","3x3"], ["4","4x4"], ["8","8x8"]]
                   },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/bayer.js'  
                 ],
  "html"       : "<div class=\"filter-map\"></div><div class=\"filter-color-div\"></div>",
  "init"       : function(element, options){

                  var index = element.data('index');           
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  var div = element.find('.filter-colors');

                  $('<input id="filter-atkinson-color-'+obj.id+'" class="filter-color" type="checkbox" '+ (options.color? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-color-div'))
                   .after('<label for="filter-atkinson-color-'+obj.id+'">Color</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.color = $(this).is(':checked');
                     result_update(index);                      
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

 
                 }, 
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('bayer', { "color" : options.color, "map" : options.map,"grayscale": options.grayscale }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
},{ "path" : "graphics/threshold",
  "name"       : "Adaptive Thresholding",
  "options"    : { 
                   "grayscale" : [0.299, 0.587, 0.114],   // [0.212, 0.715, 0.0722]
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/threshold.js'  
                 ],
  "html"       : "",  
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('threshold', { "grayscale": options.grayscale }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 },
  "help"        : "Adaptive Thresholding using Integral Image ( http://blog.inspirit.ru/?p=322 )"
},{ "path" : "graphics/set_colors",
  "name"       : "Threshold",
  "options"    : { 
                   "colors"    : ["rgb(0,0,0)","rgb(255,255,255)"],
                   "grayscale" : [0.299, 0.587, 0.114],   // [0.212, 0.715, 0.0722]
                   "scale"     : false,
                   "compare"   : "grayscale"
                 },
  "dynamic"    : ["compare"],
  "params"       : {
                    "compare"  : [["grayscale","grayscale"], ["delta rgb","delta rgb"]]
                   },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/set_colors.js'  
                 ],
  "html"       : "<button class=\"filter-add\">Add color</button>"+
                 "<div class=\"filter-colors\"></div>"+
                 "Compare method: <div class=\"filter-compare\"></div>"+
                 "<div class=\"filter-scale-div\"></div>",
  "init"       : function(element, options){

                  var index = element.data('index');
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  var div = element.find('.filter-colors');

                  $.each(options.colors,function(key,value){
                    $('<div class="filter-colors-row"><input class="filter-color" type="text" value="'+value+'" size="16"> <button class="filter-colors-row-delete">X</button></div>')
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

                   $('<input id="filter-set_colors-scale-'+obj.id+'" class="filter-scale" type="checkbox" '+ (options.scale? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-scale-div'))
                   .after('<label for="filter-set_colors-scale-'+obj.id+'">equalize grayscale</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.scale = $(this).is(':checked');
                     result_update(index);                      
                   });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   if(options.colors.length<2) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('set_colors', { "colors" : options.colors,"grayscale": options.grayscale, "scale" : options.scale, "compare" : options.compare }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
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
                 }
},{ "path" : "graphics/set_colors_dith",
  "name"       : "Threshold with dithering",
  "options"    : { 
                   "colors"    : ["rgb(0,0,0)","rgb(255,255,255)"],
                   "grayscale" : [0.299, 0.587, 0.114],   // [0.212, 0.715, 0.0722] 
                   "compare"   : "grayscale",
                   "quantize"  : false,
                   "solid"     : false
                 },
  "dynamic"    : ["compare"],
  "params"       : {
                    "compare"  : [["grayscale","grayscale"], ["delta rgb","delta rgb"]]
                   },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js',
                   'vendors/quantize.js', 
                   'vendors/pixastic/actions/set_colors_dith.js'  
                 ],
  "html"       : "<button class=\"filter-add\">Add color</button>"+
                 "<div class=\"filter-colors\"></div>"+
                 "Compare method: <div class=\"filter-compare\"></div>"+
                 "<div class=\"filter-quantize-div\"></div>"+
                 "<div class=\"filter-solid-div\"></div>",
  "init"       : function(element, options){

                  var index = element.data('index');
                  var obj = this;
                  obj.id = Math.floor(Math.random()*10000);

                  var div = element.find('.filter-colors');

                  $.each(options.colors,function(key,value){
                    $('<div class="filter-colors-row"><input class="filter-color" type="text" value="'+value+'" size="16"> <button class="filter-colors-row-delete">X</button></div>')
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

                   $('<input id="filter-set_colors-quantize-'+obj.id+'" class="filter-quantize" type="checkbox" '+ (options.quantize? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-quantize-div'))
                   .after('<label for="filter-set_colors-quantize-'+obj.id+'">Quantize by palette</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.quantize = $(this).is(':checked');
                     result_update(index);                      
                   });

                   $('<input id="filter-set_colors-solid-'+obj.id+'" class="filter-solid" type="checkbox" '+ (options.solid? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-solid-div'))
                   .after('<label for="filter-set_colors-solid-'+obj.id+'">Solid color priority</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.solid = $(this).is(':checked');
                     result_update(index);                      
                   });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   if(options.colors.length<2) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;                 
                   image
                   .css('width','auto')
                   .pixastic('set_colors_dith', { "colors" : options.colors, "grayscale": options.grayscale, "quantize" : options.quantize, "solid" : options.solid, "compare" : options.compare }, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
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
  "help"        : ""
},{ "path" : "graphics/miniaturize",
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
},{ "path" : "graphics/replace",
  "name"       : "Replace colors",
  "options"    : { "colors" : [] },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/replace_colors.js'  
                 ],
  "html"       : "<button class=\"filter-add\">Add</button>" + 
                 "<div class=\"filter-colors\"></div>",
  "init"       : function(element, options){

                  var div = element.find('.filter-colors');
                  var obj = this;

                  $.each(options.colors,function(key,value){
                    $('<div class="filter-colors-row"><input class="filter-color filter-color-src" type="text" value="'+value[0]+'" size="16"> на <input class="filter-color filter-color-dest" type="text" value="'+value[1]+'" size="16"> <button class="filter-colors-row-delete">X</button></div>')
                    .appendTo(div)
                    .find('.filter-colors-row-delete')
                      .button({"text":false,"icons":{"primary":"ui-icon-circle-close"}})
                      .click(function(){ $(this).parent().remove(); obj.update(element); })
                      .end()
                    .find('.filter-color')
                      .change(function(){ obj.update(element); });                   
                  }); 

                  element.find('.filter-add').button().click(function(){
                    $('<div class="filter-colors-row"><input class="filter-color filter-color-src" type="text" value="rgb(0,0,0)" size="16"> to <input class="filter-color filter-color-dest" type="text" value="rgb(0,0,0)" size="16"> <button class="filter-colors-row-delete">X</button></div>')
                    .appendTo(div)
                    .find('.filter-colors-row-delete')
                      .button({"text":false,"icons":{"primary":"ui-icon-circle-close"}})
                      .click(function(){ $(this).parent().remove(); obj.update(element); })
                      .end()
                    .find('.filter-color')
                      .change(function(){ obj.update(element); });
                    
                    obj.update(element);
                  });
 
                 },  
  "filter"     : function(image, options, class_out, callback){
                   if(!options.colors.length) return callback();
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('replace_colors', {"colors" : options.colors}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 },
  "update"     : function(element){
                   var index = element.data('index');
                   var options = [];
                   element.find('.filter-colors-row').each(function(){
                     var color_src  = $(this).find('.filter-color-src').val();
                     var color_dest = $(this).find('.filter-color-dest').val();
                     options.push([color_src, color_dest]);
                   });
                   config.plugins[index].options.colors = options;
                   result_update(index);                
                 }
},{ "path" : "misc/pause",
  "name"       : "Pause",
  "options"    : {},
  "html"       : "",
  "prefilter"  : function(div, options, class_out, callback){
                   state.status = 'wait';
                   state.filter++;
                   state_update('pause');                         
                 }
},{ "path" : "misc/delete",
  "name"       : "Delete",
  "options"    : {},
  "html"       : "",
  "prefilter"  : function(div, options, class_out, callback){
                   var index = div.data('index');
                   var class_in = config.plugins[index].system.class_in; 
                   div.find('.img').each(function(){
                     if(class_in=='*' || class_in==$(this).data('class'))
                       $(this).remove();
                   });
                   callback();                     
                 }
},{ "path" : "misc/change_class",
  "name"       : "Change image label",
  "options"    : {},
  "html"       : "",
  "filter"     : function(image, options, class_out, callback){
                   image.data('class', class_out);
                   callback();
                 }
},{ "path" : "misc/choose",
  "name"       : "Select",
  "options"    : { "invert" : false },
  "html"       : "Stop process and select image by click (default out label «1»)<br>" + 
                 "<div class=\"filter-div\"></div>" + 
                 "<button class=\"filter-go\" style=\"margin-top: 5px;\">Continue</button>",
  "init"       : function(element, options){

                   this.id = Math.floor(Math.random()*10000);
                   if(this.first_init){
                     this.first_init = false;
                     var index = element.data('index');
                     config.plugins[index].system.class_out = 1;
                     element.find('.class_out').val(1);
                   }
                   $('<input id="filter-choose-invert-'+this.id+'" class="filter-invert" type="checkbox" '+ (options.invert? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-div'))
                   .after('<label for="filter-choose-invert-'+this.id+'">Invert selection</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.invert = $(this).is(':checked');
                     result_update(index);                      
                   });

                   element.find('.filter-go')
                   .button()
                   .prop('id', 'filter-choose-go-'+this.id)
                   .hide();

                 },
  "prefilter"  : function(div, options, class_out, callback){
                   var images = div.find('.img');
                   var invert = options.invert;
                   $('#filter-choose-go-'+this.id)
                   .show()
                   .click(function(){ 
                     $(this).hide();  
                     callback();
                     $('.img').removeClass().removeData('old_class'); 
                   });

                   if(invert) 
                     images
                     .addClass('img-selected')
                     .each(function(){ 
                       $(this).data('old_class', $(this).data('class'));
                       $(this).data('class', class_out); 
                     });

                   images.click(function(){
                     if($(this).data('old_class')=== undefined)
                       $(this).data('old_class', class_out);
                     
                     var temp = $(this).data('old_class');
                     $(this).data('old_class', $(this).data('class'));
                     $(this).data('class', temp);

                     $(this).toggleClass('img-selected');  

                   });
                       
                 },
  "first_init" : true 
}];