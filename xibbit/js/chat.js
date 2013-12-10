
function chat_home(){

//---START-INIT---------------------------------------------------------

this.websiteLanguage = "en";

this.params = null;

this.init = new Object();
this.init.start = function(){
	var loc = window.location;
	var params = loc.hash;
	if(typeof params != "undefined" && params.length > 1){ // >1 instead of >0, so 
	                                                       // no empty tag is caught
		params = params.replace('#', ''); // don't include '#', replace first '#'
		params = $.trim(params);
		params = decodeURIComponent(params);
		params = xmppWebclient.tools.searchToObject(params);
		if(params.candystyle){
			//$('link[href="./themes/default.css"]').attr('href', params.candystyle);
			//$('link[href="./themes/default.css"]').remove();
			var append_css = document.createElement('link');
			append_css.rel = 'stylesheet';
			append_css.type = 'text/css';
			append_css.href = params.candystyle;
			document.body.appendChild(append_css);
		}
		if(params.host){
			xmppWebclient.login.connect(params);
				if(params.lang){
				var lang = params.lang;
				if(lang != "en"){
					xmppWebclient.init.initWithLang(lang);
				}
			}
			return;
		}
		if(params.lang){
			var lang = params.lang;
			if(lang != "en"){
				xmppWebclient.init.initWithLang(lang);
				return;
			}
		}
		xmppWebclient.params = params;
	}
	xmppWebclient.init.initDisplay();
	xmppWebclient.init.getData();
	xmppWebclient.init.initBindings();
};
this.init.initWithLang = function(lang){
	$.ajax("./data/"+lang+".xml")
	.done(function(data){
		/*
		 * GET PAGE IN CORRECT LANGUAGE
		 * */
		var div_login = xmppWebclient.tools.xmlToString(data.getElementsByTagName('divlogin')[0]);
		div_login = div_login.replace(new RegExp("</input>;", 'g'), "");
		$('#xmpp_webclient_login_form').html(div_login);
		xmppWebclient.websiteLanguage = lang;
	})
	.fail(function(){
		
	})
	.always(function(){
		xmppWebclient.init.initDisplay();
		xmppWebclient.init.getData();
		xmppWebclient.init.initBindings();
	});
};
this.init.getData = function(){
	/*
	* GET LIST OF SUPPORTED XMPP SERVERS
	* */
	xmppWebclient.login.getServerList();
	/*
	 * GET LIST OF CANDY STYLES
	 * */
	xmppWebclient.login.getThemeList();
};
this.init.initDisplay = function(){
	$('.xmpp.webclient.login.optional').css('display', 'none');
};
this.init.initBindings = function(){
	/*
	 * GET ADD BUTTON EVENTS ETC.
	 * */
	$('#xmpp_webclient_login_button').click(function(){
		xmppWebclient.login.connect();
	});
	$('#xmpp_webclient_enter_serverdetails').click(function(){
		$('.xmpp.webclient.login.optional').css('display', 'block');
		$('#xmpp_webclient_login_servers_label').css('display', 'none');
		$('#xmpp_webclient_login_servers').css('display', 'none');
		$('#xmpp_webclient_enter_serverdetails').css('display', 'none');
	});
	$('#xmpp_webclient_login_hide_optional').click(function(){
		$('.xmpp.webclient.login.optional').css('display', 'none');
		$('#xmpp_webclient_login_servers_label').css('display', 'block');
		$('#xmpp_webclient_login_servers').css('display', 'block');
		$('#xmpp_webclient_enter_serverdetails').css('display', 'block');
		$('input.xmpp.webclient.login.optional').attr('value', '');
	});
};

//---END-INIT-----------------------------------------------------------


//---START-LOGIN--------------------------------------------------------
this.login = new Object();
this.login.xmppServers = new Array();
this.login.candyThemes = new Array();
this.login.xmppServer = function(host, bind, muc, anon){
	return {"host": host, "bind": bind, "muc": muc, "anon": anon };
};
this.login.candyLanguages = new Array('en', 'de', 'fr', 'es', 'nl', 'cn', 'ja');
this.login.getServerList = function(){
	$.ajax("./data/servers.xml")
	.done(function(data) {
		data = $(data);
		data.find('server').each(function(){
			var host = $.trim($(this).find('host').text()+"");
			var bind = $.trim($(this).find('bind').text()+"");
			var muc = $.trim($(this).find('muc').text()+"");
			var anon = $.trim($(this).find('anon').text()+"");
			var s = new xmppWebclient.login.xmppServer(host, bind, muc, anon);
			xmppWebclient.login.xmppServers.push(s);
		});
		xmppWebclient.login.populateServerList();
		xmppWebclient.login.populateLanguageList();
	})
	.fail(function() {
		
	})
	.always(function() {
		
	});
};
this.login.getServerFromList = function(host){
	var servers = xmppWebclient.login.xmppServers;
	var len = servers.length; var i;
	var server = null;
	for(i=0; i<len; i++){
		server = servers[i];
		if(server.host == host){
			break;
		}
	}
	return server;
};
this.login.populateServerList = function(){
	var servers = xmppWebclient.login.xmppServers;
	var len = servers.length; var i;
	for(i=0; i<len; i++){
		var server = servers[i];
		var option_node = document.createElement('option');
		option_node.value = server["host"];
		option_node.innerHTML = server["host"];
		if(server["anon"].length>0){
			option_node.innerHTML += " (+a)";
		}
		option_node.className = "xmpp webclient login";
		$('#xmpp_webclient_login_servers').append(option_node);
		$('#xmpp_webclient_login_servers').val(0);
	}
	return;
};
this.login.getThemeList = function(){
	$.ajax("./themes/themes.xml")
	.done(function(data) {
		var themes = new Array();
		data = $(data);
		data.find('theme').each(function(){
			var theme = $.trim($(this).text()+"");
			themes.push(theme);
		});
		xmppWebclient.login.candyThemes = themes;
		xmppWebclient.login.populateThemeList();
	})
	.fail(function() {
		
	})
	.always(function() {
		
	});
};
this.login.populateThemeList = function(){
	var themes = xmppWebclient.login.candyThemes;
	var len = themes.length; var i;
	for(i=0; i<len; i++){
		var t = themes[i];
		var t_inner = '';
		var option_node = document.createElement('option');
		if(t.indexOf('.css')<0){
			option_node.value = './themes/'+t+'.css';
			t_inner = t;
		}else if(t.indexOf('.css')>=0 && t.indexOf('://')>=0){
			option_node.value = t;
			t_inner = t.split('/'); var t_len = t_inner.length-1;
			t_inner = t_inner[t_len];
			t_inner = t_inner.replace('.css', '');
		}else if(t.indexOf('.css')>=0 && t.indexOf('://')<0){
			option_node.value = './themes/'+t;
			t_inner = t_inner.replace('.css', '');
		}else{}
		option_node.innerHTML = t_inner;
		option_node.className = "xmpp webclient login";
		$('#xmpp_webclient_candy_style').append(option_node);
		$('#xmpp_webclient_candy_style').val(0);
	}
	return;
};
this.login.populateLanguageList = function(){
	var langs = xmppWebclient.login.candyLanguages;
	var len = langs.length; var i;
	for(i=0; i<len; i++){
		var l = langs[i];
		var option_node = document.createElement('option');
		option_node.value = l;
		option_node.innerHTML = l;
		option_node.className = "xmpp webclient login";
		$('#xmpp_webclient_login_languages').append(option_node);
		$('#xmpp_webclient_login_languages').val(0);
	}
	return;
};

this.login.connect = function(params){
	if(typeof params != "undefined" && (typeof params == "object" || typeof params == "Object" || typeof params == "Array")){
		var candy_lang = params.lang;
		var candy_host = params.host;
		var candy_muc = params.muc;
		var candy_bind = params.bind;
		var candy_rooms = params.join;
		var candy_encpass = params.encpass;
		candy_rooms = candy_rooms.split(',');
		var candy_rooms_len = candy_rooms.length; var i;
		for(i=0; i<candy_rooms_len; i++){
			var candy_room = $.trim(candy_rooms[i]);
			if(candy_room.indexOf('@')<0){
				candy_room += "@"+candy_muc;
			}
			candy_rooms[i] = candy_room;
		}
		var candy_rooms_json = JSON.parse(JSON.stringify(candy_rooms));
		
		$('div').not('#candy').css("display", "none");
		if(params.anon=="yes"){
			//console.log(candy_rooms);
			var candy_anon = params.anonymous;
			Candy.init(candy_bind, {
				core: { //debug: true ,
						autojoin: candy_rooms_json
				},
				view: { resources: './themes/',
						language: candy_lang
				},
				/*crop: { 
					message: { nickname: 15, body: 256 }, 
					roster: { nickname: 15 } 
				}*/
			});
			CandyExtend.Modules.init(candy_muc, candy_encpass);
			//CandyHistory.Hide.init();
			Candy.Core.connect(candy_anon);
		}else{
			Candy.init(candy_bind, {
				core: { //debug: true ,
						autojoin: candy_rooms_json
				},
				view: { resources: './themes/',
						language: candy_lang
				},
				/*crop: { 
					message: { nickname: 15, body: 256 }, 
					roster: { nickname: 15 } 
				}*/
			});
			CandyExtend.Modules.init(candy_muc, candy_encpass);
			//CandyHistory.Hide.init();
			Candy.Core.connect();
		}
	}else{
		var candy_lang = $('#xmpp_webclient_login_languages').find(':selected').text();
		var sel_server = $('#xmpp_webclient_login_servers').find(':selected').text();
		var has_anon = false;
		if(sel_server.indexOf("(+a)")>0){
			has_anon = true;
		}
		sel_server = $.trim(sel_server.replace("(+a)", ""));
		sel_server = xmppWebclient.login.getServerFromList(sel_server);
		var candy_anon = $.trim(sel_server.anon);
		//console.log(candy_anon); console.log(has_anon);
		var candy_host = $.trim(sel_server.host);
		var candy_bind = $.trim(sel_server.bind);
		var candy_muc = $.trim(sel_server.muc);
		
		if($.trim($('#xmpp_webclient_login_optional_host').attr('value')).length>0){
			candy_host = $.trim($('#xmpp_webclient_login_optional_host').attr('value'));
		}
		if($.trim($('#xmpp_webclient_login_optional_http').attr('value')).length>0){
			candy_bind = $.trim($('#xmpp_webclient_login_optional_http').attr('value'));
		}
		if($.trim($('#xmpp_webclient_login_optional_muc').attr('value')).length>0){
			candy_muc = $.trim($('#xmpp_webclient_login_optional_muc').attr('value'));
		}
		if($.trim($('#xmpp_webclient_login_optional_anon').attr('value')).length>0){
			candy_anon = $.trim($('#xmpp_webclient_login_optional_anon').attr('value'));
		}
		
		var candy_jid = $.trim($('#xmpp_webclient_login_jid').attr('value'));
		if(candy_jid.indexOf('@')<0){
			candy_jid = candy_jid+"@"+candy_host;
		}
		var candy_pass = $.trim($('#xmpp_webclient_login_pass').attr('value'));
		var candy_rooms = $.trim($('#xmpp_webclient_login_rooms').attr('value'));
		candy_rooms = candy_rooms.split(',');
		var candy_rooms_len = candy_rooms.length; var i;
		for(i=0; i<candy_rooms_len; i++){
			var candy_room = $.trim(candy_rooms[i]);
			if(candy_room.indexOf('@')<0){
				candy_room += "@"+candy_muc;
			}
			candy_rooms[i] = candy_room;
		}
		var candy_rooms_json = JSON.parse(JSON.stringify(candy_rooms));
		
		var candy_enc_pass = $.trim($('#xmpp_webclient_login_encpass').attr('value'));
		if(candy_enc_pass.length < 1){
			candy_enc_pass = undefined;
		}
		
		var candy_style = $('#xmpp_webclient_candy_style').find(':selected').attr('value');
		console.log(candy_style);
		if(candy_style != $('link[href="./themes/default.css"]').attr('href')){
			var append_css = document.createElement('link');
			append_css.rel = 'stylesheet';
			append_css.type = 'text/css';
			append_css.href = candy_style;
			document.body.appendChild(append_css);
		}
		
		$('div').not('#candy').css("display", "none");
		Candy.init(candy_bind, {
			core: { debug: true ,
					autojoin: candy_rooms_json
			},
			view: { resources: './themes/',
					language: candy_lang
			},
			/*crop: { 
				message: { nickname: 15, body: 256 }, 
				roster: { nickname: 15 } 
			}*/
		});
		CandyIRC.Modules.init();
		CandyAdmin.Modules.init();
		CandyExtend.Modules.init(candy_muc, candy_enc_pass);
		//CandyHistory.Hide.init();
		if(has_anon && candy_pass.length<1 && candy_anon.length>0){
			Candy.Core.connect(candy_anon, null, candy_jid);
		}else{
			Candy.Core.connect(candy_jid, candy_pass);
		}
	}
};
//---END-LOGIN----------------------------------------------------------

//---START-TOOLS--------------------------------------------------------
this.tools = new Object();
this.tools.xmlToString = function(doc){
	if (window.ActiveXObject){
        xmlString = doc.xml;
    }
    else{
        xmlString = (new XMLSerializer()).serializeToString(doc);
    }
    return xmlString;
};
this.tools.searchToObject = function(search){
  var pairs = search.substring(1).split("&"),
    obj = {},
    pair,
    i;

  for ( i in pairs ) {
    if ( pairs[i] === "" ) continue;

    pair = pairs[i].split("=");
    obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
  }

  return obj;
};
//---END-TOOLS----------------------------------------------------------

};
var xmppWebclient = new chat_home();
$(document).ready(function(){
	xmppWebclient.init.start();
});
