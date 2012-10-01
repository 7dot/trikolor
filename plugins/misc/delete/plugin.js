{
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
}