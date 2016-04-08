var express = require('express');
var mongoose = require('mongoose');
var displayaddon = require('displayaddon');
var DisplayLib = require('./node_modules/displayaddon/test/DisplayLib');

var app = express();
var config = require('./config');

var setup = function() {
  var dl = DisplayLib;
  
  var panel_l = dl.DLPanelDef();
  panel_l.panel_location = new dl.XYInfo(0,0,60,32);
  panel_l.total_size = new dl.XYInfo(0,0,120,32);
  panel_l.control = 1;
  panel_l.layout = 0; //reversed
  panel_l.position = 1; //PP_L
  
  var panel_r = dl.DLPanelDef();
  panel_r.panel_location = new dl.XYInfo(60,0,60,32);
  panel_r.total_size = new dl.XYInfo(0,0,120,32);
  panel_r.control = 2;
  panel_r.layout = 1; //normal
  panel_r.position = 2; //PP_R
  
  var clear_cmd = dl.DLDisplayCmd();
  clear_cmd.display_request = dl.DisplayRequest.DISPLAY_CLEAR;
  clear_cmd.update_type = dl.UpdateType.UPDATE_ALL;
  clear_cmd.panel = dl.GenericScope.GS_APPLIES_TO_ALL;
  clear_cmd.is_final = 1;
  
  var rect = dl.DLRect();
  rect.xy = new dl.XYInfo(0, 0, 120, 32);
  rect.line_color = new dl.DLColor(239,112,35);
  rect.panel = 1;
  rect.line_width = 2;
  
  var textbox = dl.DLTextbox();
  textbox.xy = new dl.XYInfo(3,3,114,18);
  textbox.fg_color = new dl.DLColor(43,89,249);
  //textbox.bg_color = new dl.DLColor(249,197,166);
  textbox.bg_color = new dl.DLColor(0,0,0);
  textbox.border_color = new dl.DLColor(0, 200, 0, 80);
  textbox.border_color.set_intensity (80);
  textbox.border_width = 1;
  textbox.scroll_type = 3; //SCROLL_V
  textbox.char_buffer_size = 0;
  textbox.control = 12;
  
  var text = dl.DLText();
  text.text = "A QUICK BROWN FOX";
  //text.text_action = TextAction.TEXT_APPEND;
  text.text_action = 2; //TEXT_REPLACE
  text.message = 0;
  //text.position = 0;
  text.parent_control = 12;
  
  var text2  = dl.DLText();
  text2.message = 0;
  text2.text = " JUMPED";
  text2.fg_color = new dl.DLColor(121,158,215);
  text2.text_action = 1; //TEXT_APPEND
  text2.parent_control = 12;
  
  var text3  = dl.DLText();
  text3.message = 0;
  text3.text = " OVER A LAZY DOG";
  text3.text_action = 1; //TEXT_APPEND
  text3.parent_control = 12;
  text3.is_final = 1;
  
  function reportStatus(buf) {
    console.log(buf.toString());
  }
  
  displayaddon.set_emulator(config.boardURL, config.boardPort);

  var result = panel_l.BuildMessage ();
  var send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send_config(send_buf, 1);
  
  result = panel_r.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send_config(send_buf, 2);
  
  result = clear_cmd.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send(send_buf);

  result = rect.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send(send_buf);
  
  result = textbox.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send(send_buf);
  
  result = text.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send(send_buf);
  
  result = text2.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send(send_buf);
  
  result = text3.BuildMessage ();
  send_buf = result.result_buffer.slice(0,result.result_bytes);
  displayaddon.send(send_buf, reportStatus);
}

mongoose.connect(config.databaseURL, function(err) {
  var Action = require('./action');
  if(err) throw err;
  console.log("connected to databse at " + config.databaseURL);

  app.get('/', function(req, res) {
    res.send("helloo");
  });

  app.listen(config.port, function() {
    console.log('listening on port ' + config.port);
    setup();
    Action.find({}).sort({ "$natural": -1 }).limit(1).exec(function(err,docs) {
      var doc = docs.slice(-1)[0];
      var stream = Action.find({ "_id": { "$gt": doc._id } }).tailable().stream();
    
      stream.on('data', function(doc) {
        console.log('new doc');
        console.log(doc.tag);
        console.log(doc.value);
      });
    
      stream.on('error', function(err) {
        console.log('error');
        console.log(err);
      });
    
      stream.on('end', function() {
        console.log('end of stream');
      });
    });
  });
});
