
function byId(id){
	return document.getElementById(id);
}
function makelink(){
	var lang = encodeURIComponent(byId('xmpp_lang')[byId('xmpp_lang').selectedIndex].value);
	var style_candy = encodeURIComponent(byId('xmpp_candy_style_select')[byId('xmpp_candy_style_select').selectedIndex].value);
	var style_candy_url =  encodeURIComponent(removeWhitespace(byId('xmpp_candy_style_fileurl').value));
	if(style_candy_url.length > 0){
		style_candy = style_candy_url;
	}
	var host = encodeURIComponent(removeWhitespace(byId('xmpp_host').value));
	var muc = encodeURIComponent(removeWhitespace(byId('xmpp_muc').value));
	var bind = encodeURIComponent(removeWhitespace(byId('xmpp_bind').value));
	var is_anon = encodeURIComponent(removeWhitespace(byId('xmpp_isanon').value));
	var anon = encodeURIComponent(removeWhitespace(byId('xmpp_anon').value));
	var join = encodeURIComponent(removeWhitespace(byId('xmpp_join').value));
	is_anon = ((is_anon!==null) && (is_anon=="1" || is_anon=="yes" || is_anon=="true"));
	
	var link = "?lang="+lang+"&candystyle="+style_candy+"&host="+host+"&muc="+muc+"&bind="+bind+"&join="+join;
	if(is_anon){
		link += "&anon=yes&anonymous="+anon;
	}else{
		link += "&anon=no";
	}
	
	var encpass = encodeURIComponent(removeWhitespace(byId('xmpp_enc_pass').value));
	if(encpass.length>0){
		link += '&encpass='+encpass;
	}
	
	link = '#'+encodeURIComponent(link); // pack the values in a hashtag,
	                                     // so this keeps working if we're
	                                     // not on a server but working
	                                     // with local files
	
	var location_url = (window.location.href).replace('pages/link.html', 'chat.html');
	if(location_url.indexOf('?')>0){
		location_url = location_url.split('?')[0];
	}
	if(location_url.indexOf('#')>0){
		location_url = location_url.split('#')[0];
	}
	link = location_url + link;
	
	byId('xmpp_link').value = link;
	byId('xmpp_link').select();
}
function removeWhitespace(str){
	try{
		str = str.replace(new RegExp(" ", 'g'), "");
	}catch(e){
		str = null;
	}
	return str;
}
