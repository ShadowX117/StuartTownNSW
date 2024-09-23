/*
	Javascript used for facebook elements
	http://developers.facebook.com/docs/reference/javascript/
	
	AppID: live app id??
	
	$Author: Lzhong $
	$Date: 8/18/09 11:00p $, $Revision: 0 $
*/

window.fbAsyncInit = function() {
	FB.init({appId: '130913126940286', status: true, cookie: true, xfbml: true});
};
(function() {
	var e = document.createElement('script'); e.async = true;
	e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
	document.getElementById('fb-root').appendChild(e);
}());