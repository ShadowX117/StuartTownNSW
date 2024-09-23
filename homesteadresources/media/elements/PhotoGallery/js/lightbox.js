// -----------------------------------------------------------------------------------
//
//	Lightbox v2.03.3
//	by Lokesh Dhakar - http://www.huddletogether.com
//	5/21/06
//
//	For more information on this script, visit:
//	http://huddletogether.com/projects/lightbox2/
//
//	Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
//	
//	Credit also due to those who have helped, inspired, and made their code available to the public.
//	Including: Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.com), Thomas Fuchs(mir.aculo.us), and others.
//
//******************************************************************************************
//  VERY IMPORTANT NOTE: this version of Lightbox.js has been modified, so as not to conflict with the JQuery library
//  All instances of '$' have been chnaged to 'PR' (short for Prototype), as JQuery heavily relies on the '$' symbol as well.
//  Please keep this in mind when making modifications.
//
//  Also, this version of Lightbox.js has custom Homestead functionality.
//  See \\moose\users\Builds\QS38\QS38_Websites10_Photo_Gallery\QS38_Websites10_Photo_Gallery.doc
//   - Prev/next links are always visible at the top (permaNav)
//   - Prev/next links and keyboard commands wrap when you reach the end of the list
//   - Clicking the photo simulates 'next'
//   - Image count is always displayed
//   - Display area has a fixed minimum width, even for very narrow images.
//******************************************************************************************
//
// -----------------------------------------------------------------------------------
/*

	Table of Contents
	-----------------
	Configuration
	Global Variables

	Extending Built-in Objects	
	- Object.extend(Element)
	- Array.prototype.removeDuplicates()
	- Array.prototype.empty()

	Lightbox Class Declaration
	- initialize()
	- updateImageList()
	- start()
	- changeImage()
	- resizeImageContainer()
	- showImage()
	- updateDetails()
	- updateNav()
	- enableKeyboardNav()
	- disableKeyboardNav()
	- keyboardAction()
	- preloadNeighborImages()
	- end()
	
	Miscellaneous Functions
	- getPageScroll()
	- getPageSize()
	- getKey()
	- listenKey()
	- showSelectBoxes()
	- hideSelectBoxes()
	- showFlash()
	- hideFlash()
	- showApplets()
	- hideApplets()
	- pause()
	- initLightbox()
	
	Function Calls
	- addLoadEvent(initLightbox)
	
*/
// -----------------------------------------------------------------------------------

//
//	Configuration
//
//   WARNING: pre-QS37 user pages have a script tag that manually overwrites
//   fileLoadingImage and fileBottomNavCloseImage with absolute URLs.  This is 
//   unnecessary, and QS38+ pages use the defaults defined here instead.
//
var fileLoadingImage = "homesteadresources/media/elements/PhotoGallery/images/loading.gif";		
var fileBottomNavCloseImage = "homesteadresources/media/elements/PhotoGallery/images/closelabel.gif";
var fileBottomNavCloseImageOver = "homesteadresources/media/elements/PhotoGallery/images/closelabel_over.gif";

var overlayOpacity = 0.8;	// controls transparency of shadow overlay

var animate = true;			// toggles resizing animations
var resizeSpeed = 7;		// controls the speed of the image resizing animations (1=slowest and 10=fastest)

var borderSize = 10;		//if you adjust the padding in the CSS, you will need to update this variable

// -----------------------------------------------------------------------------------

//
//	Global Variables
//
var imageArray = new Array;
var activeImage;

if(animate == true){
	overlayDuration = 0.2;	// shadow fade in/out duration
	if(resizeSpeed > 10){ resizeSpeed = 10;}
	if(resizeSpeed < 1){ resizeSpeed = 1;}
	resizeDuration = (11 - resizeSpeed) * 0.15;
} else { 
	overlayDuration = 0;
	resizeDuration = 0;
}

// -----------------------------------------------------------------------------------

//
//	Additional methods for Element added by SU, Couloir
//	- further additions by Lokesh Dhakar (huddletogether.com)
//
Object.extend(Element, {
	getWidth: function(element) {
	   	element = PR(element);
	   	return element.offsetWidth; 
	},
	setWidth: function(element,w) {
	   	element = PR(element);
    	element.style.width = w +"px";
	},
	setHeight: function(element,h) {
   		element = PR(element);
    	element.style.height = h +"px";
	},
	setTop: function(element,t) {
	   	element = PR(element);
    	element.style.top = t +"px";
	},
	setLeft: function(element,l) {
	   	element = PR(element);
    	element.style.left = l +"px";
	},
	setSrc: function(element,src) {
    	element = PR(element);
    	element.src = src; 
	},
	setHref: function(element,href) {
    	element = PR(element);
    	element.href = href; 
	},
	setInnerHTML: function(element,content) {
		element = PR(element);
		element.innerHTML = content;
	}
});

// -----------------------------------------------------------------------------------

//
//	Extending built-in Array object
//	- array.removeDuplicates()
//	- array.empty()
//
Array.prototype.removeDuplicates = function () {
    for(i = 0; i < this.length; i++){
        for(j = this.length-1; j>i; j--){        
            if(this[i][0] == this[j][0]){
                this.splice(j,1);
            }
        }
    }
}

// -----------------------------------------------------------------------------------

Array.prototype.empty = function () {
	for(i = 0; i <= this.length; i++){
		this.shift();
	}
}

// -----------------------------------------------------------------------------------

//
//	Lightbox Class Declaration
//	- initialize()
//	- start()
//	- changeImage()
//	- resizeImageContainer()
//	- showImage()
//	- updateDetails()
//	- updateNav()
//	- enableKeyboardNav()
//	- disableKeyboardNav()
//	- keyboardNavAction()
//	- preloadNeighborImages()
//	- end()
//
//	Structuring of code inspired by Scott Upton (http://www.uptonic.com/)
//
var Lightbox = Class.create();

Lightbox.prototype = {
	
	// initialize()
	// Constructor runs on completion of the DOM loading. Calls updateImageList and then
	// the function inserts html at the bottom of the page which is used to display the shadow 
	// overlay and the image container.
	//
	initialize: function() {	
		
		this.updateImageList();

		// Code inserts html at the bottom of the page that looks similar to this:
		//
		//	<div id="overlay"></div>
		//	<div id="lightbox">
		//		<div id="outerImageContainer">
		//			<div style="" id="permaNav">
		//				<a href="#" id="prevLink"></a>
		//				<a href="#" id="nextLink"></a>
		//			</div>
		//			<div id="imageContainer">
		//				<img id="lightboxImage">
		//				<div id="loading">
		//					<a href="#" id="loadingLink">
		//						<img src="images/loading.gif">
		//					</a>
		//				</div>
		//			</div>
		//		</div>
		//		<div id="imageDataContainer">
		//			<div id="imageData">
		//				<div id="imageDetails">
		//					<span id="caption"></span>
		//					<span id="numberDisplay"></span>
		//				</div>
		//				<div id="bottomNav">
		//					<a href="#" id="bottomNavClose">
		//						<img src="images/close.gif">
		//					</a>
		//				</div>
		//			</div>
		//		</div>
		//	</div>


		var objBody = document.getElementsByTagName("body").item(0);
		
		var objOverlay = document.createElement("div");
		objOverlay.setAttribute('id','overlay');
		objOverlay.style.display = 'none';
		objOverlay.onclick = function() { myLightbox.end(); }
		objBody.appendChild(objOverlay);
		
		var objLightbox = document.createElement("div");
		objLightbox.setAttribute('id','lightbox');
		objLightbox.style.display = 'none';
		objLightbox.onclick = function(e) {	// close Lightbox is user clicks shadow overlay
			if (!e) var e = window.event;
			var clickObj = Event.element(e).id;
			if ( clickObj == 'lightbox') {
				myLightbox.end();
			}
		};
		objBody.appendChild(objLightbox);
			
		var objOuterImageContainer = document.createElement("div");
		objOuterImageContainer.setAttribute('id','outerImageContainer');
		objLightbox.appendChild(objOuterImageContainer);

		// When Lightbox starts it will resize itself from 250 by 250 to the current image dimension.
		// If animations are turned off, it will be hidden as to prevent a flicker of a
		// white 250 by 250 box.
		if(animate){
			Element.setWidth('outerImageContainer', 250);
			Element.setHeight('outerImageContainer', 250);			
		} else {
			Element.setWidth('outerImageContainer', 1);
			Element.setHeight('outerImageContainer', 1);			
		}

		var objImageContainer = document.createElement("div");
		objImageContainer.setAttribute('id','imageContainer');
		objOuterImageContainer.appendChild(objImageContainer);

		var objPermaNav = document.createElement("div");
		objPermaNav.setAttribute('id','permaNav');
		objImageContainer.appendChild(objPermaNav);

		var objPrevLink = document.createElement("a");
		objPrevLink.setAttribute('id','prevLink');
		objPrevLink.setAttribute('href','#');
		//objPrevLink.onclick = function() { return false; }
		objPrevLink.setAttribute('onclick','return false;');
		objPermaNav.appendChild(objPrevLink);
		
		var objNextLink = document.createElement("a");
		objNextLink.setAttribute('id','nextLink');
		objNextLink.setAttribute('href','#');
		//objNextLink.onclick = function() { return false; }
		objNextLink.setAttribute('onclick','return false;');
		objPermaNav.appendChild(objNextLink);
		
		var objLightboxImage = document.createElement("img");
		objLightboxImage.setAttribute('id','lightboxImage');
		objImageContainer.appendChild(objLightboxImage);
	
		var objLoading = document.createElement("div");
		objLoading.setAttribute('id','loading');
		objImageContainer.appendChild(objLoading);
	
		var objLoadingLink = document.createElement("a");
		objLoadingLink.setAttribute('id','loadingLink');
		objLoadingLink.setAttribute('href','#');
		objLoadingLink.onclick = function() { myLightbox.end(); return false; }
		objLoading.appendChild(objLoadingLink);
	
		var objLoadingImage = document.createElement("img");
		objLoadingImage.setAttribute('src', fileLoadingImage);
		objLoadingLink.appendChild(objLoadingImage);

		var objImageDataContainer = document.createElement("div");
		objImageDataContainer.setAttribute('id','imageDataContainer');
		objLightbox.appendChild(objImageDataContainer);

		var objImageData = document.createElement("div");
		objImageData.setAttribute('id','imageData');
		objImageDataContainer.appendChild(objImageData);
	
		var objImageDetails = document.createElement("div");
		objImageDetails.setAttribute('id','imageDetails');
		objImageData.appendChild(objImageDetails);
	
		var objCaption = document.createElement("span");
		objCaption.setAttribute('id','caption');
		objImageDetails.appendChild(objCaption);
	
		var objNumberDisplay = document.createElement("span");
		objNumberDisplay.setAttribute('id','numberDisplay');
		objImageDetails.appendChild(objNumberDisplay);
		
		var objBottomNav = document.createElement("div");
		objBottomNav.setAttribute('id','bottomNav');
		objImageData.appendChild(objBottomNav);
	
		var objBottomNavCloseLink = document.createElement("a");
		objBottomNavCloseLink.setAttribute('id','bottomNavClose');
		objBottomNavCloseLink.setAttribute('href','#');
		objBottomNavCloseLink.onclick = function() { myLightbox.end(); return false; }
		objBottomNav.appendChild(objBottomNavCloseLink);
	
		var objBottomNavCloseImage = document.createElement("img");
		objBottomNavCloseImage.setAttribute('src', fileBottomNavCloseImage);
		objBottomNavCloseImage.onmouseover = function() { this.src = fileBottomNavCloseImageOver; }
		objBottomNavCloseImage.onmouseout = function() { this.src = fileBottomNavCloseImage; }
		objBottomNavCloseLink.appendChild(objBottomNavCloseImage);
	},


	//
	// updateImageList()
	// Loops through anchor tags looking for 'lightbox' references and applies onclick
	// events to appropriate links. You can rerun after dynamically adding images w/ajax.
	//
	updateImageList: function() {	
		if (!document.getElementsByTagName){ return; }
		var anchors = document.getElementsByTagName('a');
		var areas = document.getElementsByTagName('area');

		// loop through all anchor tags
		for (var i=0; i<anchors.length; i++){
			var anchor = anchors[i];
			
			var relAttribute = String(anchor.getAttribute('rel'));
			
			// use the string.match() method to catch 'lightbox' references in the rel attribute
			if (anchor.getAttribute('href') && (relAttribute.toLowerCase().match('lightbox'))){
				anchor.onclick = function () {myLightbox.start(this); return false;}
			}
		}

		// loop through all area tags
		// todo: combine anchor & area tag loops
		for (var i=0; i< areas.length; i++){
			var area = areas[i];
			
			var relAttribute = String(area.getAttribute('rel'));
			
			// use the string.match() method to catch 'lightbox' references in the rel attribute
			if (area.getAttribute('href') && (relAttribute.toLowerCase().match('lightbox'))){
				area.onclick = function () {myLightbox.start(this); return false;}
			}
		}
	},
	
	
	//
	//	start()
	//	Display overlay and lightbox. If image is part of a set, add siblings to imageArray.
	//
	start: function(imageLink) {	

		hideSelectBoxes();
		hideFlash();
		hideApplets();

		// stretch overlay to fill page and fade in
		var arrayPageSize = getPageSize();
		Element.setWidth('overlay', arrayPageSize[0]);
		Element.setHeight('overlay', arrayPageSize[1]);

		new Effect.Appear('overlay', { duration: overlayDuration, from: 0.0, to: overlayOpacity });

		imageArray = [];
		imageNum = 0;		

		if (!document.getElementsByTagName){ return; }
		var anchors = document.getElementsByTagName( imageLink.tagName);

		// if image is NOT part of a set..
		if((imageLink.getAttribute('rel') == 'lightbox')){
			// add single image to imageArray
			// we push attributes into imageArray
			// 'href' = image's filename
			// 'id' = Styling information (textfont and color) (note, this is put the id attribute instead of style, because IE6 has problems getting the attribute as a string when it is put into style)
			// 'name' = unique thumbnail ID, used to identify between images with the same 'href'
			// 'title' = caption, placed in this attribute for tooltip functionality
			imageArray.push(new Array(imageLink.getAttribute('href'), imageLink.getAttribute('id'), imageLink.getAttribute('name'), imageLink.getAttribute('title')));					
		} else {
		// if image is part of a set..

			// loop through anchors, find other images in set, and add them to imageArray
			for (var i=0; i<anchors.length; i++){
				var anchor = anchors[i];
				if (anchor.getAttribute('href') && (anchor.getAttribute('rel') == imageLink.getAttribute('rel'))){
					// See above for information about attributes
					imageArray.push(new Array(anchor.getAttribute('href'), anchor.getAttribute('id'), anchor.getAttribute('name'), anchor.getAttribute('title')));
				}
			}
			// We check that the image has the same 'href' and 'name' (unique thumbnail id) to identify the correct place in imageArray to start.
			// if either 'href' or 'name' don't match, then we don't have the exact image we want called up (both filename and thumbID must match to exit out of the loop)
			while((imageArray[imageNum][0] != imageLink.getAttribute('href')) || (imageArray[imageNum][2] != imageLink.getAttribute('name'))) { 
				imageNum++;
				}
		}

		// Only show nav links if there are more than one photos in the set.
		if (imageArray.length > 1) {
			Element.show('prevLink');
			Element.show('nextLink');
		} else {
			Element.hide('prevLink');
			Element.hide('nextLink');
		}

		// calculate top and left offset for the lightbox 
		var arrayPageScroll = getPageScroll();
		var lightboxTop = arrayPageScroll[1] + (arrayPageSize[3] / 10);
		var lightboxLeft = arrayPageScroll[0];
		Element.setTop('lightbox', lightboxTop);
		Element.setLeft('lightbox', lightboxLeft);
		
		Element.show('lightbox');
		
		this.changeImage(imageNum);
	},

	//
	//	changeImage()
	//	Hide most elements and preload image in preparation for resizing image container.
	//
	changeImage: function(imageNum) {	
		
		activeImage = imageNum;	// update global var

		// hide elements during transition
		if(animate){ Element.show('loading');}
		Element.hide('lightboxImage');
		Element.hide('imageDataContainer');
		Element.hide('numberDisplay');
		
		// Deactivate navigation links until the photo is fully displayed.
		// Browsing too fast (before the image is ready) leads to a mismatch between the image and the info being displayed.
		document.getElementById('prevLink').onclick = document.getElementById('nextLink').onclick = document.getElementById('lightboxImage').onclick = function() { return false; }
		
		imgPreloader = new Image();
		
		// once image is preloaded, resize image container
		imgPreloader.onload=function(){
			Element.setSrc('lightboxImage', imageArray[activeImage][0]);
			myLightbox.resizeImageContainer(imgPreloader.width, imgPreloader.height);
			
			imgPreloader.onload=function(){};	//	clear onLoad, IE behaves irratically with animated gifs otherwise 
		}
		imgPreloader.src = imageArray[activeImage][0];
	},

	//
	//	resizeImageContainer()
	//
	resizeImageContainer: function( imgWidth, imgHeight) {
		// Scale to fit the browser window so the user can see the entire image without having to scroll.
		// Also, maintain the aspect ratio to avoid stretching the image out of proportion.
		var arrayPageSize = getPageSize();
		var windowWidth = arrayPageSize[2];
		var windowHeight = arrayPageSize[3];
		var imgWidthNew = imgWidth;
		var imgHeightNew = imgHeight;
		// Browser window width available for the image
		// This is calculated by substracting the border sizes from the width of the browser window. 
		var windowWidthAvailable = (windowWidth - (borderSize * 2));
		// Browser window height available for the image
		// This is calculated by subtracting the offset from the top of the window, the border sizes, the height of the top nav,
		// and the height of the bottom nav from the height of the browser window.
		var windowHeightAvailable = (windowHeight - (windowHeight / 10) - (borderSize * 2) - (imageArray.length > 1 ? 10 : 0) - 33);
		if (imgWidthNew  > windowWidthAvailable) {
			imgWidthNew = windowWidthAvailable;
			imgHeightNew = imgWidthNew * imgHeight / imgWidth;
		}
		if (imgHeightNew > windowHeightAvailable) {
			imgHeightNew = windowHeightAvailable * .80; //WEB007811 Image height has to be 62% of the outer image container so that bottom menu, image comments and image numbers are not hidden behind the image. QS72: 60% is too small, so we land somewhere in the middle.
			imgWidthNew = imgHeightNew * imgWidth / imgHeight;
		}
		
		// get curren width and height
		this.widthCurrent = Element.getWidth('outerImageContainer');
		this.heightCurrent = Element.getHeight('outerImageContainer');

		// get new width and height
		var widthNew = (imgWidthNew  + (borderSize * 2));
		var heightNew = (imgHeightNew  + (borderSize * 2)) + (imageArray.length > 1 ? 10 : 0) + 20; // include space for top nav and bottom close buttons
		
		// lock minimum width of display box to size of "< prev | next >" links
		widthNew = Math.max(widthNew, 118 + (borderSize * 2));
		
		// scalars based on change from old to new
		this.xScale = ( widthNew / this.widthCurrent) * 100;
		this.yScale = ( heightNew / this.heightCurrent) * 100;

		// calculate size difference between new and old image, and resize if necessary
		wDiff = this.widthCurrent - widthNew;
		hDiff = this.heightCurrent - heightNew;

		if(!( hDiff == 0)){ new Effect.Scale('outerImageContainer', this.yScale, {scaleX: false, duration: resizeDuration, queue: 'front'}); }
		if(!( wDiff == 0)){ new Effect.Scale('outerImageContainer', this.xScale, {scaleY: false, delay: resizeDuration, duration: resizeDuration}); }

		// if new and old image are same size and no scaling transition is necessary, 
		// do a quick pause to prevent image flicker.
		if((hDiff == 0) && (wDiff == 0)){
			if (navigator.appVersion.indexOf("MSIE")!=-1){ pause(250); } else { pause(100);} 
		}

		Element.setWidth('lightboxImage', imgWidthNew);
		Element.setHeight('lightboxImage', imgHeightNew);
		Element.setWidth( 'imageDataContainer', widthNew);

		this.showImage();
	},
	
	//
	//	showImage()
	//	Display image and begin preloading neighbors.
	//
	showImage: function(){
		Element.hide('loading');
		new Effect.Appear('lightboxImage', { duration: resizeDuration, queue: 'end', afterFinish: function(){	myLightbox.updateDetails(); } });
		this.preloadNeighborImages();
	},

	//
	//	updateDetails()
	//	Display caption, image number, and bottom nav.
	//
	updateDetails: function() {
	
		// if caption is not null
		if(imageArray[activeImage][1]){
			Element.show('caption');
			// add HTML regarding image settings
			// imageArray[activeImage][1] = 'id' = style settings (textfont and color)
			// imageArray[activeImage][3] = 'title' = caption
			Element.setInnerHTML( 'caption', '<div style="' + imageArray[activeImage][1] + '">' + imageArray[activeImage][3]);
		}
		
		// display 'Image x of x' 
		Element.show('numberDisplay');
		Element.setInnerHTML( 'numberDisplay', "Image " + eval(activeImage + 1) + " of " + imageArray.length);

		new Effect.Parallel(
			[ new Effect.SlideDown( 'imageDataContainer', { sync: true, duration: resizeDuration, from: 0.0, to: 1.0 }), 
			  new Effect.Appear('imageDataContainer', { sync: true, duration: resizeDuration }) ], 
			{ duration: resizeDuration, afterFinish: function() {
				// update overlay size and update nav
				var arrayPageSize = getPageSize();
				Element.setHeight('overlay', arrayPageSize[1]);
				myLightbox.updateNav();
				}
			} 
		);
	},

	//
	//	updateNav()
	//	Update target of previous and next navigation buttons.
	//
	updateNav: function() {
		if (imageArray.length > 1) {
			// wrap to the end if we are on the first image.
			document.getElementById('prevLink').onclick = function() {
				myLightbox.changeImage((activeImage > 0 ? activeImage - 1 : imageArray.length - 1)); return false;
			}

			// wrap to the beginning if we are on the last image.
			document.getElementById('nextLink').onclick = function() {
				myLightbox.changeImage((activeImage < (imageArray.length - 1) ? activeImage + 1 : 0)); return false;
			}
			
			// clicking the image is the same as clicking 'next'.
			document.getElementById('lightboxImage').onclick = document.getElementById('nextLink').onclick;
			
			this.enableKeyboardNav();
		} else {
			document.getElementById('prevLink').onclick = '';
			document.getElementById('nextLink').onclick = '';
			document.getElementById('lightboxImage').onclick = '';
		}
	},

	//
	//	enableKeyboardNav()
	//
	enableKeyboardNav: function() {
		document.onkeydown = this.keyboardAction; 
	},

	//
	//	disableKeyboardNav()
	//
	disableKeyboardNav: function() {
		document.onkeydown = '';
	},

	//
	//	keyboardAction()
	//
	keyboardAction: function(e) {
		if (e == null) { // ie
			keycode = event.keyCode;
			escapeKey = 27;
		} else { // mozilla
			keycode = e.keyCode;
			escapeKey = e.DOM_VK_ESCAPE;
		}

		key = String.fromCharCode(keycode).toLowerCase();
		
		if((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)){	// close lightbox
			myLightbox.end();
		} else if((key == 'p') || (keycode == 37)){	// display previous image (wrap if at beginning)
			myLightbox.disableKeyboardNav();
			myLightbox.changeImage(activeImage > 0 ? activeImage - 1 : imageArray.length - 1);
		} else if((key == 'n') || (keycode == 39)){	// display next image (wrap if at end)
			myLightbox.disableKeyboardNav();
			myLightbox.changeImage(activeImage < (imageArray.length - 1) ? activeImage + 1 : 0);
		}

	},

	//
	//	preloadNeighborImages()
	//	Preload previous and next images.
	//
	preloadNeighborImages: function(){

		if((imageArray.length - 1) > activeImage){
			preloadNextImage = new Image();
			preloadNextImage.src = imageArray[activeImage + 1][0];
		}
		if(activeImage > 0){
			preloadPrevImage = new Image();
			preloadPrevImage.src = imageArray[activeImage - 1][0];
		}
	
	},

	//
	//	end()
	//
	end: function() {
		this.disableKeyboardNav();
		Element.hide('lightbox');
		new Effect.Fade('overlay', { duration: overlayDuration});
		showSelectBoxes();
		showFlash();
		showApplets();
	}
}

// -----------------------------------------------------------------------------------

//
// getPageScroll()
// Returns array with x,y page scroll values.
// Core code from - quirksmode.com
//
function getPageScroll(){

	var xScroll, yScroll;

	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
		xScroll = self.pageXOffset;
	} else if (document.documentElement && document.documentElement.scrollTop){	 // Explorer 6 Strict
		yScroll = document.documentElement.scrollTop;
		xScroll = document.documentElement.scrollLeft;
	} else if (document.body) {// all other Explorers
		yScroll = document.body.scrollTop;
		xScroll = document.body.scrollLeft;	
	}

	arrayPageScroll = new Array(xScroll,yScroll) 
	return arrayPageScroll;
}

// -----------------------------------------------------------------------------------

//
// getPageSize()
// Returns array with page width, height and window width, height
// Core code from - quirksmode.com
// Edit for Firefox by pHaez
//
function getPageSize(){
	
	var xScroll, yScroll;
	
	if (window.innerHeight && window.scrollMaxY) {	
		xScroll = window.innerWidth + window.scrollMaxX;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;
	
//	console.log(self.innerWidth);
//	console.log(document.documentElement.clientWidth);

	if (self.innerHeight) {	// all except Explorer
		if(document.documentElement.clientWidth){
			windowWidth = document.documentElement.clientWidth; 
		} else {
			windowWidth = self.innerWidth;
		}
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	
	// for small pages with total height less then height of the viewport
	if(yScroll < windowHeight){
		pageHeight = windowHeight;
	} else { 
		pageHeight = yScroll;
	}

//	console.log("xScroll " + xScroll)
//	console.log("windowWidth " + windowWidth)

	// for small pages with total width less then width of the viewport
	if(xScroll < windowWidth){	
		pageWidth = xScroll;		
	} else {
		pageWidth = windowWidth;
	}
//	console.log("pageWidth " + pageWidth)

	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
	return arrayPageSize;
}

// -----------------------------------------------------------------------------------

//
// getKey(key)
// Gets keycode. If 'x' is pressed then it hides the lightbox.
//
function getKey(e){
	if (e == null) { // ie
		keycode = event.keyCode;
	} else { // mozilla
		keycode = e.which;
	}
	key = String.fromCharCode(keycode).toLowerCase();
	
	if(key == 'x'){
	}
}

// -----------------------------------------------------------------------------------

//
// listenKey()
//
function listenKey () {	document.onkeypress = getKey; }
	
// ---------------------------------------------------

function showSelectBoxes(){
	var selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
		selects[i].style.visibility = "visible";
	}
}

// ---------------------------------------------------

function hideSelectBoxes(){
	var selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
		selects[i].style.visibility = "hidden";
	}
}

// ---------------------------------------------------

function showFlash(){
	var flashObjects = document.getElementsByTagName("object");
	for (i = 0; i < flashObjects.length; i++) {
		flashObjects[i].style.visibility = "visible";
	}

	var flashEmbeds = document.getElementsByTagName("embed");
	for (i = 0; i < flashEmbeds.length; i++) {
		flashEmbeds[i].style.visibility = "visible";
	}
}

// ---------------------------------------------------

function hideFlash(){
	var flashObjects = document.getElementsByTagName("object");
	for (i = 0; i < flashObjects.length; i++) {
		flashObjects[i].style.visibility = "hidden";
	}

	var flashEmbeds = document.getElementsByTagName("embed");
	for (i = 0; i < flashEmbeds.length; i++) {
		flashEmbeds[i].style.visibility = "hidden";
	}

}

// ---------------------------------------------------

function showApplets(){
	var applets = document.getElementsByTagName("applet");
	for (i = 0; i < applets.length; i++) {
		applets[i].style.visibility = "visible";
	}
}

// ---------------------------------------------------

function hideApplets(){
	var applets = document.getElementsByTagName("applet");
	for (i = 0; i < applets.length; i++) {
		applets[i].style.visibility = "hidden";
	}
}


// ---------------------------------------------------

//
// pause(numberMillis)
// Pauses code execution for specified time. Uses busy code, not good.
// Help from Ran Bar-On [ran2103@gmail.com]
//

function pause(ms){
	var date = new Date();
	curDate = null;
	do{var curDate = new Date();}
	while( curDate - date < ms);
}
/*
function pause(numberMillis) {
	var curently = new Date().getTime() + sender;
	while (new Date().getTime();	
}
*/
// ---------------------------------------------------



function initLightbox() { myLightbox = new Lightbox(); }
Event.observe(window, 'load', initLightbox, false);
