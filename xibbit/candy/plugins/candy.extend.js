var CandyExtend = (function(self) { return self; }(CandyExtend || {}));

CandyExtend.Modules = (function(self, Candy, $) {
	var originalOnMessage = Candy.Core.Event.Jabber.Room.Message;
	var muc_service = "";
	var aes_password = "";
	self.init = function(muc, pass){
		if(typeof pass == "string" || typeof pass == "String"){
			aes_password = $.trim(pass);
		}
		muc_service = muc;
		
		Candy.Util.Parser.emoticons = new Array(); //empty, no emoticons
		
		Candy.View.Event.Room.onAdd = function(evtData){
			$('input[name="message"]').attr('maxlength', '256');
			return;
		};
		
		Candy.View.Event.Message.beforeSend = function(message){
			$('input[name="message"]').attr('maxlength', '256'); // horrible way of assigning a new maxlength...
			var msg = ($.trim(message));
			var is_command = msg.indexOf('/') == 0;
			if(is_command){
				msg = msg.replace(/\s+/g, ' ');
				CandyIRC.Modules.processCommand(msg);
				return "";
			}else{
				if(aes_password.length>0){
					message = sjcl.encrypt(aes_password, message, {"mode": "ocb2", "ks": 256, "ts": 128, "iter": 1000});
				}
				return message;
			}
		};
		Candy.View.Event.Message.beforeShow = function(args){
			$('input[name="message"]').attr('maxlength', '256');
			if(aes_password.length>0) {
				var dec;
				try{
					args.message = args.message;
					dec = sjcl.decrypt(aes_password, args.message);
					if(dec.length < args.message.length){
						dec = sjcl.decrypt(aes_password, args.message);
					}
					return dec;
				}catch(e){
					//return "[CHAT: Received a message that could not be decrypted. Probably sent from another client, or the sender is using a different encryption password.]";
					return "";
				}
			}else{
				return args.message;
			}
		};
		Candy.Core.Action.Jabber.Room.Join = function(room_jid, room_pass){
			Candy.Core.Action.Jabber.Room.Disco(room_jid);
			// dear servers, get it or leave it...
			// http://www.tigase.org/content/muc-managing-discussion-history-does-not-work *sign*
			Candy.Core.getConnection().muc.join(room_jid, Candy.Core.getUser().getNick(), null, null, room_pass, {"maxchars": 0});
		};
		Candy.Core.Event.Jabber.Room.Message = function(msg){
			
			/*
			 * "bugfix" (somewhat): if a message is sent not as a private message,
			 * bug we receive an actual instant message (non muc) from another client,
			 * ui bugs occur (i.e. cannot write in current room and such). so discard
			 * this messages before they cause any kind of chaos.
			 * */
			 var from_jid = msg.attr('from');
			 if(from_jid.indexOf(muc_service) < 0){
				 return true;
			 }
			
			// some servers still show return all the history, even if maxchars='0'.
			// strophe bug? server bug? sometimes this, sometimes that...
			var delay = msg.children('delay') ? msg.children('delay') : msg.children('x[xmlns="' + Strophe.NS.DELAY +'"]'),
					timestamp = delay !== undefined ? delay.attr('stamp') : null;
			var is_groupchat = !((msg.attr('type') == "chat") || (msg.attr('type') == "error"));
			var is_delayed_message = (delay.length > 0);
			if(is_groupchat && is_delayed_message){
				return true;
			}else{
				originalOnMessage(msg);
				return true;
			}
		};
	};
	return self;
}(CandyExtend.Modules|| {}, Candy, jQuery));
