'use strict';

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function() {

	var padtext = function(text, paddingChar, length) {
		for (var i=0; i<=(length - text.length); i++) {
			text = paddingChar + text;
		}
		return text;
	};

	var actionTakephoto = $('#actiontakephoto');
	var actionGallery = $('#actiongallery');
	var actionShare = $('#actionshare');

	var groupTakePhoto = $('#grouptakephoto');
	var groupGallery = $('#groupgallery');
	var groupShare = $('#groupshare');

	var viewCamera = $('#cameraview');
	var canvasCameraView = document.getElementById('canvascameraview');
	var ctxCameraView = canvasCameraView.getContext('2d');
	
	var viewgallery = $('#gallery');
	var viewflip = $('#viewflip');
	
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	// button actions
	actionTakephoto.bind('touch click', function() {
		// call camera take photos and return with data array of photo file names/ or scan the photo folder to check for new photos
		// construct json data of the photos and use here
		openViewCamera();
	});
	actionGallery.bind('touch click', function() {
		// view, play, share the created flip books
		openViewGallery();
	});
	actionShare.bind('touch click', function() {
		// view, play, share the created flip books
	});

	// preload images

	// get images from data folder - group by name, sort by date/time
	// could possibly use socket to listen for new files and inject here
	var imageSetId = 0;
	var imageFrameIndex = 0;
	var imagesets = [];

	// load data from server
	$.getJSON( "/data/data.json", function( data ) {

		imagesets = data;

		for(var p=0; p<imagesets.length; p++)
		{
			imagesets[p].images = new Array(imagesets[p].end);
		}

		imageSetId = 0;
		imageFrameIndex = imagesets[imageSetId].start;

	});
	// another data loading possible - scan phone photo albums (android:snapburst, iphone:?)
	


	var openViewGallery = function() {
		console.log('open view gallery');

		renderGallery();

		viewCamera.hide();
		viewflip.hide();
		viewgallery.show();
	};

	var openViewCamera = function() {
		console.log('open view camera');

		viewCamera.show();
		viewflip.hide();
		viewgallery.hide();
	};

	var openViewFlipbook = function(setid) {

		imageSetId = setid;
		loadImages(imageSetId, imagesets[imageSetId].start);

		console.log('open view flipbook');

		viewCamera.hide();
		viewflip.show();
		viewgallery.hide();

	};

	var eventLoadingComplete = new CustomEvent(
		"loadingFlipbookComplete", 
		{
			detail: {
				image: 0,
				time: new Date(),
			},
			bubbles: true,
			cancelable: true
		}
	);

	var fps = 20;
	var enableLoop = true;

	var render = function() {

  	if (imageFrameIndex < imagesets[imageSetId].end) {

			setTimeout(function() {
				requestAnimFrame(render);	

				// draw stuff
				ctx.drawImage(imagesets[imageSetId].images[imageFrameIndex], 0, 0, canvas.width, canvas.height);
		    imageFrameIndex++;

			}, 1000 / fps);
	    
  	} else {
  		// loop for insanity...
  		if (enableLoop) {
	  		imageFrameIndex = imagesets[imageSetId].start;
				requestAnimFrame(render);	
			}
  	}

  };
	
	var startDefaultView = function() {

		$('#loading').hide();

		openViewGallery();

	};

	var renderGallery = function() {
		// render 1st image into image cells
		// using reactjs component to render this
	};

	$('.thumbnail').bind('click touch', function() {
		console.log('thumbnail click');
	});

	var loadImages = function(imagesetIdx, imagesidx) {
		
		if (imagesetIdx < imagesets.length) {
			if (imagesidx <= imagesets[imagesetIdx].end) {
				var img = new Image();
				img.index = imagesidx;
				img.src = 'data/' + imagesets[imagesetIdx].prefix + '_' + padtext('' + imagesidx, '0', 3) + '.' + imagesets[imagesetIdx].type;
				
				img.onload = function() {
					imagesets[imagesetIdx].images[imagesidx] = img;
					imagesets[imagesetIdx].loadCounter++;

					if (imagesets[imagesetIdx].loadCounter == imagesets[imagesetIdx].end) {
						document.getElementById('loading').dispatchEvent(eventLoadingComplete);
					}

				}

				return loadImages(imagesetIdx, imagesidx + 1);
			} else {
				imagesetIdx = imagesetIdx + 1;
				return loadImages(imagesetIdx, imagesetIdx < imagesets.length ? imagesets[imagesetIdx].start : 0);
			}
		} else {
			return true;
		}
		
	};

	startDefaultView();

	// loads default view when loading is done
	document.addEventListener("loadingFlipbookComplete", function() {
		render();
	}, false);

	// create slideshow inside canvas

	// change controls to a slider to scrub flip book animation

})(jQuery);

