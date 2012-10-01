{
  "name"       : "Noise",
  "options"    : {
                   "amount"   : 0.5,
                   "strength" : 0.5,
                   "mono"     : false
                 },
  "load"       : [ 
                   'vendors/pixastic/pixastic.core.js',
                   'vendors/pixastic/pixastic.jquery.js', 
                   'vendors/pixastic/actions/noise.js'  
                 ],
  "html"       : "Amount: <span class=\"filter-amount\"></span><div class=\"filter-amount-slider\"></div>" +
                 "Strength: <span class=\"filter-strength\"></span><div class=\"filter-strength-slider\"></div>" + 
                 "<div class=\"filter-mono-div\"></div>",
  "init"       : function(element,options){

                   var index = element.data('index');
                   this.id = Math.floor(Math.random()*10000);

                   element.find('.filter-amount-slider').slider({
                     value: options.amount,
                     orientation: "horizontal",
                     range: "min",
                     min: 0,
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

                   element.find('.filter-strength-slider').slider({
                     value: options.strength,
                     orientation: "horizontal",
                     range: "min",
                     min: 0,
                     max: 1,
                     step: 0.01,
                     animate: true,
                     slide: function(event,ui){ element.find('.filter-strength').text(ui.value); },
                     change: function(event,ui){ 
                       config.plugins[index].options.strength = ui.value;
                       result_update(index);
                     } 
                   });
                   element.find('.filter-strength').text(options.strength);

                   $('<input id="filter-noise-mono-'+this.id+'" class="filter-mono" type="checkbox" '+ (options.mono? 'checked' : '' ) +'>')
                   .appendTo(element.find('.filter-mono-div'))
                   .after('<label for="filter-noise-mono-'+this.id+'">Mono</label>')
                   .button()
                   .change(function(){
                     var index = element.data('index');
                     config.plugins[index].options.mono = $(this).is(':checked');
                     result_update(index);                      
                   });

                 },
  "filter"     : function(image, options, class_out, callback){
                   var class_out =  class_out == '*' ? image.data('class') : class_out;
                   image
                   .css('width','auto')
                   .pixastic('noise', {"amount" : options.amount, "strength" : options.strength, "mono" : options.mono}, function(res){
                     result_image(res, res.toDataURL("image/png"), null, class_out, callback);
                   });
                 }
}