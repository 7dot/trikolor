$(function(){

// =========== layout =========================

$('body').layout({ 
  applyDefaultStyles: true,
  west__size: 370
});

$('#pane-actions').layout({ 
  applyDefaultStyles: true,
  north__size: "auto",
  south__size: "auto"
});


// ============ header ========================
$('#btn-help')
.button({
  icons: { primary: "ui-icon-help" },
  text: false
})
.click(function(){
  $( "#dialog-help" )
  .empty()
  .append('<pre></pre>').children().load('readme.txt').end()
  .dialog({
    height: 480,
    width: 640,
    modal: true
  }); 
});

// ============ presets & config ==============
$("#config")
.focus(function(){ $(this).select(); })
.change(function(){
  config=$.parseJSON($(this).val());
  update('total');
});

$("#preset_name").change(function(){
  config.name = $(this).val();
  update_config();
});

$('#preset').change(function(){
  config = clone(presets[$(this).val()]);
  update('total');
});

$("#btn-preset-options")
.button({
  text: false,
  icons: { primary: "ui-icon-wrench" },
  label: "Options"
})
.click(function(){
  $('#options').toggle();
  $('#pane-actions').layout().resizeAll(); 
});

$("#btn-preset-save")
.button({
  text: false,
  icons: { primary: "ui-icon-disk" },
  label: "Save"
})
.click(function(){
  presets[$('#preset').val()]=clone(config);
  localStorage.setItem('presets', $.toJSON(presets));  
});

$("#btn-preset-new")
.button({
  text: false,
  icons: { primary: "ui-icon-document" },
  label: "New"
})
.click(function(){
  var i=presets.length;
  presets[i]={
    "name"    : "New",
    "scale"   : 64,
    "plugins" : []
  };
  $('#preset').append('<option value="'+i+'" selected>New</option>');
  config=clone(presets[i]);
  update('total');  
});

$("#btn-preset-delete")
.button({
  text: false,
  icons: { primary: "ui-icon-trash" },
  label: "Delete"
})
.click(function(){
  var i=$('#preset').val();
  $('#preset option:selected').remove();
  presets[i]=null;
  config=clone(presets[$('#preset').val()]);
  update('total');
});


// ============ filters =======================

$("#filters" )
.sortable({
  connectWith : "#filters",
  update      : function(){ filters_change(); }
});


// ============ controls ======================

$("#slider").slider({
  value: 64,
  orientation: "horizontal",
  range: "min",
  min: 32,
  max: 320,
  step: 2,
  animate: true,
  slide: function(event,ui){    
    $("#slider-display").text(ui.value+'px');
    $('.img').css('width',ui.value+'px');
  },
  change: function(event,ui){ 
    config.scale = ui.value;
    $('#config').val($.toJSON(config));
  }
});
$("#slider-display").text($("#slider").slider("option","value")+'px');

$("#checkbox-class")
.button({
  label:"Show labels",
  icons: { primary: "ui-icon-tag" },
  text: false
})
.change(function(){ 
  var checked=$(this).is(':checked'); 
  $('#img-button-class').css('display', checked?'inline':'none');
  $('.dataclass').css('display', checked? 'block' : 'none');   
});

$('.control button:first').button({ icons: { primary: "ui-icon-play" } })
.next().button({ icons: { primary: "ui-icon-stop" } })
.next().button({ icons: { primary: "ui-icon-carat-1-w" } })
.next().button({ icons: { primary: "ui-icon-carat-1-e" } })
$('.control button')
.button("disable")
.button("option","text",false)
.click(function(){ state_update($(this).text()); });

// =============================================
$(document).keypress(function(e){
  switch(e.keyCode){
    case 37:  // arrow left
      if($('#dialog-viewer').is(':visible')) viewer_change('prev');    
      break;
    case 39:  // arrow right
      if($('#dialog-viewer').is(':visible')) viewer_change('next');
      break;
  }
});

$('#img-button-delete')
.button({
  icons: { primary: "ui-icon-trash" },
  text: false
})
.click(function(){
  $('.img:visible').eq($(this).parent().data('index')).remove();
  $('#img-button').hide();
});

$('#img-button-class').change(function(){
  $('.img:visible').eq($(this).parent().data('index')).data('class',$(this).val());
});

$('#progressbar').progressbar();


});