var CandyIRC = (function(self) { return self; }(CandyIRC || {}));
CandyIRC.Modules = (function(self, Candy, $) {

self.init = function(){
	
};

self.processCommand = function(message){
	var command = message.split(' ')[0];
	if(command == '/join'){
		var msg = message.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'');
		var msg_arr = msg.split(' ');
		var room_jid = msg_arr[1];
		var room_pass = msg_arr[2];
		if(typeof room_pass != "undefined"){
			if(room_pass.length < 0){
				room_pass = null;
			}
		}
		if(typeof room_jid != "undefined"){
			if(room_jid.length > 0){
				if(room_jid.indexOf('@')<0){
					var muc_url = Candy.View.getCurrent().roomJid;
					muc_url = (muc_url.split('@')[1]).split('/')[0];
					room_jid = room_jid+'@'+muc_url;
				}
			}
		}
		Candy.Core.Action.Jabber.Room.Disco(room_jid);
		Candy.Core.getConnection().muc.join(room_jid, Candy.Core.getUser().getNick(), null, null, room_pass, {"maxchars": 0});
	}else if(command == '/part'){
		var room_jid = Candy.View.getCurrent().roomJid;
		if(!(room_jid.indexOf('/')>0)){
			Candy.Core.getConnection().muc.leave(Candy.View.getCurrent().roomJid, Candy.Core.getUser().getNick(), null, null);
		}else{}
	}else if(command=='/ignore'){
		var room_jid = Candy.View.getCurrent().roomJid;
		if(room_jid.indexOf('/')<0){
			var user_nick = message.split(' ')[1];
			var user_jid = room_jid+'/'+user_nick;
			Candy.View.Pane.Room.ignoreUser(room_jid, user_jid);
		}
	}else if(command=='/unignore'){
		var room_jid = Candy.View.getCurrent().roomJid;
		if(room_jid.indexOf('/')<0){
			var user_nick = message.split(' ')[1];
			var user_jid = room_jid+'/'+user_nick;
			Candy.View.Pane.Room.unignoreUser(room_jid, user_jid);
		}
	}else if(command == '/invite'){
		var msg_arr = message.split(' ');
		var room_jid = msg_arr[1];
		var recv_jid = msg_arr[2];
		var msg_arr2 = message.split('"');
		var reason = msg_arr2[1] || null;
		var password = msg_arr2[2] || null;
		if(password != null) password = $.trim(password);
		
		var attrs, invitation, msgid;
		msgid = Candy.Core.getConnection().getUniqueId();
		attrs = {
		xmlns: 'jabber:x:conference',
		jid: room_jid
		};
		if (reason != null) {
		attrs.reason = reason;
		}
		if (password != null) {
		attrs.password = password;
		}
		invitation = $msg({
		from: Candy.Core.getConnection().jid,
		to: recv_jid,
		id: msgid
		}).c('x', attrs);
		Candy.Core.getConnection().send(invitation);
		
		msgid = Candy.Core.getConnection().getUniqueId();
		invitation = $msg({
		  from: Candy.Core.getConnection().jid,
		  to: room_jid,
		  id: msgid
		}).c('x', {
		  xmlns: Strophe.NS.MUC_USER
		}).c('invite', {
		  to: recv_jid
		});
		if (reason != null) {
		  invitation.c('reason', reason);
		}
		Candy.Core.getConnection().send(invitation);
		
	}else if(command == '/query'){
		var recv_nick = message.split(' ')[1];
		var msg_text = message.replace('/query '+recv_nick, '');
		var room_jid = Candy.View.getCurrent().roomJid;
		if(!(room_jid.indexOf('/')>0)){
			room_jid = room_jid+'/'+recv_nick;
			var room_name = recv_nick;
			Candy.View.Pane.PrivateRoom.open(room_jid, room_name, true, false);
		}else{}
	}else if(command=='/names'){
		var room_jid = Candy.View.getCurrent().roomJid;
		if(!(room_jid.indexOf('/')>0)){
			var room_obj = Candy.Core.getRoom(room_jid);
			var room_roster = room_obj.getRoster();
			var room_roster_items = room_roster.items;
			console.log(room_roster_items);
			var room_roster_msg = '';
			for(var u in room_roster_items){
				if((typeof u).toLowerCase()=='string'){
					u = room_roster_items[u];
				}
				var jid = u.data.jid || '';
				var nick = u.data.nick;
				var aff = u.data.affiliation;
				var role = u.data.role;
				if(aff == 'owner'){
					room_roster_msg += nick+'[owner] ';
				}else if(aff=='admin'){
					room_roster_msg += nick+'[admin] ';
				}else if(role == 'moderator'){
					room_roster_msg += nick+'[moderator] ';
				}else{
					room_roster_msg += nick+' ';
				}
			}
			Candy.View.Pane.Chat.infoMessage(room_jid, 'Users: ', room_roster_msg);
		}else{
			// this is a private chat, no /names command
		}
	}else{
		CandyAdmin.Modules.processCommand(message);
	}
	return "";
};

return self;
}(CandyIRC.Modules|| {}, Candy, jQuery));
