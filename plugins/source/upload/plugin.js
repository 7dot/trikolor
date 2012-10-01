{
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
}