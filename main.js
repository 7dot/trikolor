// ================= config ==================

var proxy = 'server/proxy.php?url=';

// ================= init ====================

var config = {}, state = {}, loaded = [], img_count=0;

$(function(){

  state_init();
  scripts_load(plugins, 'object', 'plugins/', '/plugin.js');

  if(localStorage['presets']) presets = $.parseJSON(localStorage['presets']);  
  else scripts_load(presets, 'json', 'presets/', '.json');

  for(var i in presets)
    if(presets[i])
      $('#preset').append('<option value="'+i+'">'+presets[i].name+'</option>'); 
  
  config = clone(presets[$('#preset').val()]);
  update_config();
    
  plugins_icon_update();
  update_filters();

});

// =========== functions ===================

function clone(obj){  
  var newObj = (obj instanceof Array) ? [] : {};  
  for (i in obj)   
    if(obj[i] && typeof obj[i] == "object") newObj[i] = clone(obj[i]);  
    else newObj[i] = obj[i];
  return newObj;  
};

function scripts_load(list, mode, prefix, postfix){

  if(list.length==0) return null;

  var url,
      mode = mode || 'script', 
      prefix = prefix || '', 
      postfix = postfix || '';

  $.ajaxSetup({async: false});

  for(var i in list)
    if(typeof list[i] === 'string' && $.inArray(url = prefix + list[i] + postfix,loaded) === -1){
      loaded.push(url);
      var ext = url.substring(url.lastIndexOf('.'));
      if(ext == '.css')
        $('<link rel="stylesheet" type="text/css" href="'+url+'">').appendTo('head');
      else if(mode==='script') $.getScript(url);
      else if(mode==='json') $.getJSON(url, function(data){ list[i] = data; });
      else if(mode==='object') 
        $.get(url, function(data){
          var path = list[i];
          list[i] = eval('('+data+')');
          list[i].path = path;
        },'html');       
    }

  $.ajaxSetup({async: true});

}

function update_config(){
  $('#config').val($.toJSON(config));
  $('#preset_name').val(config.name);
  $('#preset option:selected').html(config.name);
  $("#slider-display").text(config.scale+'px');
  $("#slider").slider("option","value",config.scale);
}

function plugins_icon_update(){

  for(var i in plugins){
    var icon = $('<button></button>')
    .button({
      text: false,
      icons: { primary: "ui-icon-document-b" },
      label: plugins[i].name
    })
    .appendTo('#filters-icons-'+plugins[i].path.split('/')[0])
    .data('index', i)
    .click(function(){
      var i = $(this).data('index');
      var index = config.plugins.length;
      config.plugins[index] = {
        "path"      : plugins[i].path,
        "options"   : clone(plugins[i].options || {}),
        "system"    : {"class_in" : "*", "class_out" : "*", "expand" : true, "clone" : false}
      };
      update_config();
      scripts_load(plugins[i].load || []);
      filters_add(index, plugins[i], config.plugins[index].options, config.plugins[index].system);
      state_update();
    });  
     
    var css = 'sprite-icon-' + plugins[i].path.replace(/\//,'-');
    if(!!getDefinedCss(css))
      icon.children('span.ui-icon').removeClass('ui-icon-document-b')
                                   .addClass('sprite-icon').addClass(css);
    else icon.children('span.ui-icon').css('background','url("plugins/'+plugins[i].path+'/icon.png")');

  }

  $('#pane-actions').layout().resizeAll();  

}

function update_filters(){

  $('#filters').empty();
  for(var j in config.plugins)
    for(var i in plugins)
      if(config.plugins[j].path == plugins[i].path){
        scripts_load(plugins[i].load || []);
        filters_add(j, plugins[i], config.plugins[j].options, config.plugins[j].system);
        break;
      }

  state_update();

}

function filters_add(index, plugin, options, system){

  var element = $('<div class="portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"><div class="portlet-header ui-widget-header"><span class="ui-icon ui-icon-close close" title="delete"><\/span><span class="ui-icon ui-icon-minus minus" title="expand"><\/span>'+(plugin.help?'<span class="ui-icon ui-icon-help help" title="help"><\/span>':'')+plugin.name+'<\/div><div class="portlet-content">'+plugin.html+'<div class="dataclass"><hr><input class="clone" id="clone-'+index+'" type="checkbox"'+(system.clone?' checked':'')+'><label for="clone-'+index+'">Clone</label> Label: in<input class="class_in" size="7" type="text" value="'+system.class_in+'"> out<input class="class_out" size="7" type="text" value="'+system.class_out+'"><\/div><\/div><\/div>')
  .appendTo('#filters')
  .data('index',index)

  .find(".portlet-header .help")
  .click(function(){
    $( "#dialog-help" )
    .empty()
    .html(plugin.help)
    .dialog({
      height: 480,
      width: 640,
      modal: true
    });
  }).end()

  .find(".portlet-header .minus")
  .click(function(){
    var portlet = $(this).parents(".portlet:first");
    var index = portlet.data('index');
    $(this).toggleClass("ui-icon-minus").toggleClass("ui-icon-plus");
    portlet.find(".portlet-content").toggle();
    config.plugins[index].system.expand = $(this).hasClass("ui-icon-minus");
    update_config();
  }).end()
  
  .find(".portlet-header .close")
  .click(function(){
    var portlet = $(this).parents(".portlet:first");
    var index = portlet.data('index');
    portlet.remove();
    config.plugins.splice(index,1);
    result_update(index);
  }).end()

  .find(".class_in,.class_out")
  .change(function(){
    var portlet = $(this).parents(".portlet:first");
    var index = portlet.data('index');
    config.plugins[index].system[$(this).prop('class')] = $(this).val();
    result_update(index);
  }).end()

  .find(".clone")
  .button()
  .change(function(){
    var portlet = $(this).parents(".portlet:first");
    var index = portlet.data('index');
    config.plugins[index].system.clone = $(this).is(':checked');
    result_update(index);
  }).end();

  if(!system.expand){ 
    element.find(".portlet-content").toggle();
    element.find(".portlet-header .minus").toggleClass("ui-icon-minus").toggleClass("ui-icon-plus");
  }
  if(!$('#checkbox-class').is(':checked')) $('.dataclass').css('display', 'none');

  if(plugin.init instanceof Function) plugin.init(element, options);

}

function filters_change(){
  var new_plugins = [];
  var change = null;
  $('#filters .portlet').each(function(index){
    var index_prev=$(this).data('index');
    new_plugins[index]=clone(config.plugins[index_prev]);
    if(change===null && index_prev!=index) change=index;
  });
  config.plugins=new_plugins;
  result_update(change);
}

function state_update(command){
  if(command) state.control = command;

  $('.control button').button("disable");
  $("#btn-control-play").button("enable");  $("#btn-control-play").button("enable");
  if(state.control=='play')
    $('#btn-control-play').button("option", {label: "pause", icons: { primary: "ui-icon-pause" } });
  else
    $('#btn-control-play').button("option", {label: "play", icons: { primary: "ui-icon-play" } });

  if(config.plugins.length==0)  return;

  $("#btn-control-stop").button("enable");

  if(state.filter===0)                      $("#btn-control-prev").button("disable");
  else                                      $("#btn-control-prev").button("enable");

  if(state.filter>=config.plugins.length) $("#btn-control-next").button("disable");
  else                                      $("#btn-control-next").button("enable");

  if(state.filter>=config.plugins.length && state.control!=='stop' && state.control!=='prev')
    return filter_highlight();

  if(state.control=='play'){
    if(state.filter===null) state.filter=0;
    filter_execute(state.filter);
    return; 
  }else if(state.control == 'next'){
    if(state.filter===null) state.filter=0;
    filter_execute(state.filter);
    state.control='pause';
    return;  
  }else if(state.control == 'prev'){
    state.filter = $('.images-result:eq('+state.filter+')').is('div') ? state.filter-1 : state.filter-2;
    state.filter = state.filter<0? 0 : state.filter;
    state.control='pause';
    $('.images-result:gt('+state.filter+')').remove();
    $('.images-result:last').show();
  }else if(state.control=='stop'){
    state.filter = 0;
    state.control='pause';
    state.status = 'wait';
    $('#result .images-result').remove();
  }else if(state.control=='pause'){
    state.status = 'wait';
    return filter_highlight();
  }

  filter_highlight(); 
  state_update();

}

function filter_highlight(index){
  $('.portlet-header').removeClass('ui-selected');
  var index = index || $('.images-result:visible').data('index');
  $('.portlet:eq('+index+')').find('.portlet-header').addClass('ui-selected');
}

function filter_execute(index){
  if(state.status == 'execute') return;
  state.status = 'execute';
  img_count=0;
  filter_highlight(index);

  $("#progressbar").progressbar("option", "value", 0).show();
  
  $('.images-result:eq('+index+')').remove()
  .nextAll().remove();

  result = $('<div class="images-result"></div>')
  .appendTo('#result')
  .data('index',index)
  .sortable({
    items:'img',
    cursor: 'move',
    sort: function(event, ui) { $('#img-button').hide(); }
  })
  .disableSelection();

  if(index>0){
    $('.images-result').hide(); 
    result.show().prev().find('.img').each(function(index){
      result_image_event( $(this).clone().appendTo(result).addClass('pass').data('class',$(this).data('class')) );
    });
  }

  for(var i=0; i<plugins.length; i++)
    if(config.plugins[index].path == plugins[i].path){
      
      var is_filter = plugins[i].filter instanceof Function;

      result.find('.img').each(function(){ 
        if( is_filter && (config.plugins[index].system.class_in=='*' || config.plugins[index].system.class_in==$(this).data('class')) ){
          img_count++;
          if(config.plugins[index].system.clone) $(this).clone(true).insertBefore($(this));
          $(this).removeClass('pass');
        }        
      });

      var callback = index && is_filter ? 
                       function(){ filter_img(result, config.plugins[index].options, plugins[i], 0, config.plugins[index].system.class_out); } 
                     : function(){ filter_execute_end(); };
      var class_out =  config.plugins[index].system.class_out == '*' ? '' : config.plugins[index].system.class_out;

      if(plugins[i].prefilter instanceof Function) 
        plugins[i].prefilter( result, config.plugins[index].options, class_out, callback);
      else callback();

      break;
    }
}

function filter_execute_end(){
  $("#progressbar").hide();
  state.status = 'wait';
  state.filter++;
  state_update();
}

function filter_img(div, options, plugin, index, class_out){
  if(state.status=='wait') return;
  if(index >= img_count) return filter_execute_end();
  var img = div.find('.img').not('.pass').eq(index);
  $("#progressbar").progressbar("option", "value", index*100/img_count );
  plugin.filter(img, options, class_out, function(){ filter_img(div, options, plugin, ++index, class_out); });   
}

function state_init(){
  state = {
    "control" : 'play',
    "status"  : 'wait',
    "filter"  :  null
  };
}

function update(opt){
  if(opt=='total'){ 
    state_init();
    $('#result .images-result').remove();
  }
  update_config();
  update_filters();
}

function result_update(index){
  if(state.filter!==null && state.filter>=index){
    state.status='wait';
    $('.images-result:eq('+index+')').nextAll().remove().end().remove();  
    $('.images-result:last').show();
    state.filter = index;   
  }
  update();
}

function result_image(elem, src, mode, class_out, callback){
  var img = $('<img class="img">')
  .prop('src', src)
  .error(function(){ 
    $(this).remove(); 
    callback(); 
  })
  .load(function(){ 
    result_image_event($(this));
    callback(); 
  })
  .data('class', class_out)
  .css({"width": $("#slider").slider("option","value") +"px"});

  if(img){
    if(mode==='new') img.appendTo(elem);
    else             img.replaceAll(elem);
  }

  return img;
}

function result_image_event(img){
  img
  .dblclick(function(){
    $('#img-button').hide();
    $("#dialog-viewer")
    .html('<img id="viewer_img" src="'+$(this).prop('src')+'">')
    .dialog({
      modal: true,
      width: 'auto',
      height: 'auto'
    });
    $('#viewer_img').data('index',$(this).index('.img:visible'));   
  })
  .hover(
    function(){
      var of=$(this).offset();
      $('#img-button')
      .css({"top" : of.top,"left" : of.left})
      .data('index', $(this).index('.img:visible'))
      .show();
      $('#img-button-class').val($(this).data('class'));
    },
    function(e){
     var of=$(this).offset();
     var box = { "x1" : of.left, "y1" : of.top, "x2" : of.left+$(this).width(), "y2" : of.top + $(this).height() }
     if(!(e.pageX>box.x1 && e.pageX<box.x2 && e.pageY>box.y1 && e.pageY<box.y2))
       $('#img-button').hide();     
    }
  );
}

function viewer_change(mode){

  var index = $('#viewer_img').data('index');
  var max_index = $('.img:visible').last().index('.img:visible');

  if(mode == 'next'){
    if(++index > max_index) index = 0;
  }else 
    if(--index < 0) index = max_index;

  $('#viewer_img')
  .prop('src', $('.img:visible').eq(index).prop('src'))
  .data('index',index);

  $("#dialog-viewer").dialog("option", "position", "center");

}

function getDefinedCss(s){
    if(!document.styleSheets) return '';
    if(typeof s== 'string') s= RegExp('\\b'+s+'\\b','i'); // IE capitalizes html selectors 

    var A, S, DS= document.styleSheets, n= DS.length, SA= [];
    while(n){
        S= DS[--n];
        A= (S.rules)? S.rules: S.cssRules;
        for(var i= 0, L= A.length; i<L; i++){
                tem= A[i].selectorText? [A[i].selectorText, A[i].style.cssText]: [A[i]+''];
                if(s.test(tem[0])) SA[SA.length]= tem;
        }
    }
    return SA.join('\n\n');
}