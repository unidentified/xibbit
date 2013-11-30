$(document).ready(function(){
	populateThemeList();
});
function populateThemeList(){
	$.ajax("../../themes/themes.xml")
	.done(function(data) {
		var themes = new Array();
		data = $(data);
		data.find('theme').each(function(){
			var theme = $.trim($(this).text()+"");
			themes.push(theme);
		});
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
			option_node.className = "xmpp webclient";
			$('#xmpp_candy_style_select').append(option_node);
			$('#xmpp_candy_style_select').val(0);
		}
	})
	.fail(function() {
		
	})
	.always(function() {
		
	});
};
function byId(id){
	return document.getElementById(id);
};
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
	
	var location_url = (window.location.href).replace('pages/en/link.html', 'chat.html');
	location_url = location_url.replace('pages/de/link.html', 'chat.html');
	if(location_url.indexOf('?')>0){
		location_url = location_url.split('?')[0];
	}
	if(location_url.indexOf('#')>0){
		location_url = location_url.split('#')[0];
	}
	link = location_url + link;
	
	byId('xmpp_link').value = link;
	byId('xmpp_link').select();
};
function removeWhitespace(str){
	try{
		str = str.replace(new RegExp(" ", 'g'), "");
	}catch(e){
		str = null;
	}
	return str;
};
