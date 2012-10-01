{
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
}