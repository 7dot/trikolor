{
  "name"       : "Pause",
  "options"    : {},
  "html"       : "",
  "prefilter"  : function(div, options, class_out, callback){
                   state.status = 'wait';
                   state.filter++;
                   state_update('pause');                         
                 }
}