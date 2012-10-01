{
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
}