var CandyAdmin = (function(self) { return self; }(CandyAdmin || {}));
CandyAdmin.Modules = (function(self, Candy, $) {
	
self.init = function(){
	
};

self.processCommand = function(message){
	if(Candy.View.getCurrent().roomJid.indexOf('/')>0){
		return "";
	}
	var command = message.split(' ')[0];
	if(command=='/config'){
		var room_jid = Candy.View.getCurrent().roomJid;
		self.configureRoom(room_jid);
	}else if(command=='/kick'){
		var msg_arr = message.split(' ');
		var room_jid = Candy.View.getCurrent().roomJid;
		var user_jid = msg_arr[1]; var user_nick = user_jid.split('@')[0];
		var reason = message.replace((msg_arr[0]+' '+msg_arr[1]), '');
		var iq = $iq({"to": room_jid, 
					  "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
					  "item", {"nick": user_nick, "role": "none"}).c("reason").t(reason);
		var stanza = iq.tree();
		Candy.Core.getConnection().sendIQ(stanza, null, null);
	}else if(command=='/ban'){
		var msg_arr = message.split(' ');
		var room_jid = Candy.View.getCurrent().roomJid;
		var user_jid = msg_arr[1]; 
		var reason = message.replace((msg_arr[0]+' '+msg_arr[1]), '');
		if(user_jid.indexOf('@')<0){
			// this is a nick 
			var user_nick = user_jid;
			var iq = $iq({"to": room_jid, 
					  "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
					  "item", {"nick": user_nick, "affiliation": "outcast"}).c("reason").t(reason);
		}else{
			var iq = $iq({"to": room_jid, 
					  "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
					  "item", {"jid": user_jid, "affiliation": "outcast"}).c("reason").t(reason);
		}
		var stanza = iq.tree();
		Candy.Core.getConnection().sendIQ(stanza, null, null);
	}else if(command=='/unban'){
		var msg_arr = message.split(' ');
		var room_jid = Candy.View.getCurrent().roomJid;
		var user_jid = msg_arr[1]; 
		var reason = message.replace((msg_arr[0]+' '+msg_arr[1]), '');
		var iq = $iq({"to": room_jid, 
					  "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
					  "item", {"jid": user_jid, "affiliation": "none"}).c("reason").t(reason);
		var stanza = iq.tree();
		Candy.Core.getConnection().sendIQ(stanza, null, null);
	}else if(command=='/list'){
		var role_or_affiliation = message.split(' ')[1];
		if(role_or_affiliation=='outcast' || role_or_affiliation=='none' || role_or_affiliation=='member' || role_or_affiliation=='admin' || role_or_affiliation =='owner'){
			var affiliation = role_or_affiliation;
			var room_jid = Candy.View.getCurrent().roomJid;
			var iq = $iq({"to": room_jid, "type": "get"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
						  "item", {"affiliation": affiliation});
			var stanza = iq.tree();
			Candy.Core.getConnection().sendIQ(stanza, self.handleAffiliationList, null);
		}else if(role_or_affiliation=='moderator' || role_or_affiliation=='participant'){
			var role = role_or_affiliation;
			var room_jid = Candy.View.getCurrent().roomJid;
			var iq = $iq({"to": room_jid, "type": "get"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
						  "item", {"role": role});
			var stanza = iq.tree();
			Candy.Core.getConnection().sendIQ(stanza, self.handleRoleList, null);
		}else{
		}
	}else if(command=='/set'){
		var msg_arr = message.split(' ');
		var set_type = msg_arr[1];
		var room_jid = Candy.View.getCurrent().roomJid;
		if(set_type=='affiliation'){
			var affiliation = msg_arr[2];
			var user_nick = msg_arr[3];
			if(user_nick.indexOf('@')>0){
				var user_jid = user_nick;
				if(user_jid.indexOf('/')>0) user_jid=user_jid.split('/')[0];
				var iq = $iq({"to": room_jid, "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
						  "item", {"jid": user_jid, "affiliation": affiliation});
			}else{
				var iq = $iq({"to": room_jid, "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
						  "item", {"nick": user_nick, "affiliation": affiliation});
			}
			var stanza = iq.tree();
			Candy.Core.getConnection().sendIQ(stanza, null, null);
		}else if(set_type=='role'){
			var role = msg_arr[2];
			var user_nick = msg_arr[3];
			var iq = $iq({"to": room_jid, "type": "set"}).c("query", {"xmlns":"http://jabber.org/protocol/muc#admin"}).c(
						  "item", {"nick": user_nick, "role": role});
			var stanza = iq.tree();
			Candy.Core.getConnection().sendIQ(stanza, null, null);
		}else{}
	}else{
		
	}
	return "";
};

//---START-HANDLE-LIST--------------------------------------------------

self.handleAffiliationList = function(lst){
	var room_jid = $(lst).attr('from');
	var affiliation = '';
	var msg = '';
	$(lst).find('item').each(function(){
		var jid = $(this).attr('jid');
		affiliation = $(this).attr('affiliation');
		msg += '['+jid + '] ';
		//Candy.View.Pane
	});
	if(affiliation==''){
		Candy.View.Pane.Chat.infoMessage(room_jid, '', 'There are no users with this affiliation.');
	}else{
		var subject = "Users with affiliation "+affiliation+": ";
		Candy.View.Pane.Chat.infoMessage(room_jid, subject, msg);
	}
	return true;
};

self.handleRoleList = function(lst){
	var room_jid = $(lst).attr('from');
	var items = $(lst).find('item');
	var msg = '';
	var role ='';
	if(items.length>0){
		items.each(function(){
			var nick = $(this).attr('nick');
			var jid = $(this).attr('jid') || null;
			if(jid!=null){
				if(jid.indexOf('/')>0){
					jid = jid.split('/')[0];
				}
			}
			role = $(this).attr('role');
			msg += '['+nick;
			if(jid!==null){
				msg += ' ('+jid+')] ';
			}else{
				msg == '] ';
			}
		});
		var subject = "Users with role "+role+": ";
		Candy.View.Pane.Chat.infoMessage(room_jid, subject, msg);
	}else{
		Candy.View.Pane.Chat.infoMessage(room_jid, '', 'There are no users with this role.');
	}
	return true;
};

//---END-HANDLE-LIST----------------------------------------------------

//---START-ROOM-CONFIGURATION-------------------------------------------
self.configureRoom = function(room){
	var config, stanza;
	config = $iq({
	  to: room,
	  type: "get"
	}).c("query", {
	  xmlns: Strophe.NS.MUC_OWNER
	});
	stanza = config.tree();
	Candy.Core.getConnection().sendIQ(stanza, self.onConfigureRoomSuccess, self.onConfigureRoomError);
	return true;
};
self.onConfigureRoomSuccess = function(form){
	var x_form = Strophe.x.Form.fromXML(form.getElementsByTagName('x')[0]);
	jq_form = $(form);
	var room_jid = jq_form.attr('from');
	var user_jid = jq_form.attr('to');
	self.showRoomConfig(x_form, room_jid, user_jid);
	return true;
};
self.onConfigureRoomError = function(err){
	alert("Sorry, you cannot configure this room - are you the owner?");
	return true;
};
self.showRoomConfig = function(xform, room_jid, user_jid){
	 var conf_div = document.createElement('div');
	 conf_div.setAttribute('id', 'muc_room_configuration');
	 conf_div.setAttribute('class', 'muc_room_configuration');
	 var conf_heading = document.createElement('h1');
	 conf_heading.setAttribute('class', 'muc_room_configuration');
	 conf_heading.innerHTML = xform.title;
	 conf_div.appendChild(conf_heading);
	 var conf_ul = document.createElement('ul');
	 conf_ul.setAttribute('class', 'muc_room_configuration');
	 
	 var len = xform.fields.length;
	 for(var i=0; i<len; i++){
		 var field = xform.fields[i];
		 var f_label = field.label;
		 var f_var = field['var'];
		 var f_type = field.type;
		 var f_val = field.values[0];
		 var f_options = field.options;
		 
		 var f_supported = (f_type.indexOf('boolean')>=0) || (f_type.indexOf('text-single')>=0) ||
		 (f_type.indexOf('text-private')>=0) || (f_type.indexOf('list-single')>=0);
		 if(f_supported){
			 var conf_li = document.createElement('li');
			 conf_li.setAttribute('class', 'muc_room_configuration');
			 conf_li.setAttribute('id', f_var);
			 var conf_span_label = document.createElement('span');
			 conf_span_label.setAttribute('class', 'muc_room_configuration');
			 conf_span_label.innerHTML = f_label;
			 var conf_span_type = document.createElement('span');
			 conf_span_type.setAttribute('class', 'muc_room_configuration');
			 conf_span_type.innerHTML = f_type;
			 conf_span_type.setAttribute('style', 'display: none');
			 //var conf_span_var = document.createElement('span');
			 //conf_span_var.innerHTML = f_var;
			 //conf_span_var.setAttribute('style', 'display: none');
			 conf_li.appendChild(conf_span_label);
			 conf_li.appendChild(conf_span_type);
			 //conf_li.appendChild(conf_span_var);
			 
			 if(f_type.indexOf('boolean')>=0){
				 var conf_input = document.createElement('input');
				 conf_input.setAttribute('class', 'muc_room_configuration');
				 conf_input.setAttribute('type', 'checkbox');
				 if(f_val=='1' || f_val==1){
					 conf_input.setAttribute('checked', 'yes');
				 }
				 conf_li.appendChild(conf_input);
			 }else if(f_type.indexOf('text-single')>=0){
				 var conf_input = document.createElement('input');
				 conf_input.setAttribute('class', 'muc_room_configuration');
				 conf_input.setAttribute('type', 'text');
				 conf_input.value = f_val || "";
				 conf_li.appendChild(conf_input);
			 }else if(f_type.indexOf('text-private')>=0){
				 var conf_input = document.createElement('input');
				 conf_input.setAttribute('class', 'muc_room_configuration');
				 conf_input.setAttribute('type', 'password');
				 conf_input.value = f_val || "";
				 conf_li.appendChild(conf_input);
			 }else if(f_type.indexOf('list-single')>=0){
				 var conf_select = document.createElement('select');
				 conf_select.setAttribute('class', 'muc_room_configuration');
				 for(var j=0; j<f_options.length; j++){
					 var f_opt = f_options[j];
					 var conf_opt = document.createElement('option');
					 conf_opt.setAttribute('class', 'muc_room_configuration');
					 conf_opt.value = f_opt.value;
					 conf_opt.innerHTML = f_opt.label;
					 if(f_opt.value == f_val){
						 conf_opt.selected = true;
					 }
					 conf_select.appendChild(conf_opt);
				 }
				 conf_li.appendChild(conf_select);
			 }else{}
			 conf_ul.appendChild(conf_li);
		 }//if(f_supported)
		 
	 }//for(var i=0; i<len; i++)
	 
	 var conf_button_submit = document.createElement('input');
	 conf_button_submit.setAttribute('class', 'muc_room_configuration');
	 conf_button_submit.setAttribute('type', 'button');
	 conf_button_submit.setAttribute('id', 'room_configuration_submit_button');
	 conf_button_submit.setAttribute('value', 'Submit');
	 var conf_li_button = document.createElement('li');
	 conf_li_button.setAttribute('class', 'muc_room_configuration');
	 conf_li_button.appendChild(conf_button_submit);
	 conf_ul.appendChild(conf_li_button);
	 
	 var conf_button_cancel = document.createElement('input');
	 conf_button_cancel.setAttribute('class', 'muc_room_configuration');
	 conf_button_cancel.setAttribute('type', 'button');
	 conf_button_cancel.setAttribute('id', 'room_configuration_cancel_button');
	 conf_button_cancel.setAttribute('value', 'Cancel');
	 var conf_li_button = document.createElement('li');
	 conf_li_button.setAttribute('class', 'muc_room_configuration');
	 conf_li_button.appendChild(conf_button_cancel);
	 conf_ul.appendChild(conf_li_button);
	
	 conf_div.appendChild(conf_ul);
	 var conf_div_style = "position: absolute; width: 100%; heigth: 100%; top: 0; z-index: 2000; display: block;";
	 conf_div.setAttribute('style', conf_div_style);
	 document.getElementsByTagName('body')[0].appendChild(conf_div);
	 
	 $('#room_configuration_submit_button').click(function(){
		 self.processRoomConfig(xform, room_jid, user_jid);
	 });
	 
	 $('#room_configuration_cancel_button').click(function(){
		 self.cancelRoomConfig(room_jid);
	 });
	 return true;
};
self.processRoomConfig = function(xform, room_jid, user_jid){
	var new_fields = new Array();
	var len = xform.fields.length;
	for(var i=0; i<len; i++){
		var field = xform.fields[i];
		var f_var = field['var'];
		var f_type = field.type;
		var f_val = field.values[0];
		var _li = document.getElementById(f_var);
		console.log(_li);
		_li = $(_li);
		if(_li.length>0){
			if(f_type.indexOf('boolean')>=0){
				_li.find('input').each(function(){
					if($(this).prop('checked')){
						f_val = '1';
					}else{
						f_val = '0';
					}
				});
			}else if(f_type.indexOf('text-single')>=0){
				_li.find('input').each(function(){
					f_val = $(this).attr('value');
					console.log(f_val);
				});
			}else if(f_type.indexOf('text-private')>=0){
				_li.find('input').each(function(){
					f_val = $(this).attr('value');
				});
			}else if(f_type.indexOf('list-single')>=0){
				_li.find(':selected').each(function(){
					f_val = $(this).attr('value');
				});
			}else{}
			
		}//if($('#'+f_var).length>0)
		field.values[0] = f_val || "";
		var x_field = {"var": field['var'], "type": field.type, "values": field.values, 
						"required": field.required };
		//x_field = Strophe.x.Field(x_field);
		new_fields.push(x_field);
		new_fields[i] = new Strophe.x.Field(new_fields[i]);
	}//for(var i=0; i<len; i++)
	self.sendRoomConfig(new_fields, room_jid, user_jid);
	return true;
};
self.cancelRoomConfig = function(room_jid){
	var config, stanza;
	config = $iq({
	  to: room_jid,
	  type: "set"
	}).c("query", {
	  xmlns: Strophe.NS.MUC_OWNER
	}).c("x", {
	  xmlns: "jabber:x:data",
	  type: "cancel"
	});
	stanza = config.tree();
	Candy.Core.getConnection().sendIQ(stanza);
	$('#muc_room_configuration').remove();
	return true;
};
self.sendRoomConfig = function(fields, room_jid, user_jid){
	var x_form = new Strophe.x.Form({"type": "submit", "fields": fields});
	var xml_form = x_form.toXML();
	
	var iq = $iq({
	  to: room_jid,
	  type: "set"
	}).c("query", {
	  xmlns: Strophe.NS.MUC_OWNER
	});
	iq.cnode(xml_form);
	var stanza = iq.tree();
	console.log(stanza);
	Candy.Core.getConnection().sendIQ(stanza, self.roomConfigSuccess, self.roomConfigError);
	$('#muc_room_configuration').remove();
	return true;
};
self.roomConfigSuccess = function(a,b,c){
	alert("Room has been configured!");
	return true;
};
self.roomConfigError = function(a,b,c){
	alert("Sorry, room configuration did not work!");
	return true;
};
//---END-ROOM-CONFIGURATION---------------------------------------------

return self;
}(CandyAdmin.Modules|| {}, Candy, jQuery));
