/**
 * PhotoController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var PhotoController = {
	dataPath : './assets/data',
	find: function(req, res) {
		var fs = require('fs');
		var photos = new Array();

		fs.readdir(PhotoController.dataPath, function(err, files) {

			for(var i=0; i<files.length; i++) {
				if (files[i].indexOf('.jpg') > 0 || files[i].indexOf('.png') > 0 ) {
					var photoFile = {
						src :  req.protocol + '://' + req.get('host') + '/data/' + files[i],
						dateCreated: new Date()
					};

					fs.stat(PhotoController.dataPath + '/' + files[i], function(err, stats) {
						photoFile.dateCreated = stats.ctime;
					});
					
					photos.push(photoFile);	
				}
			}
			res.json(photos);
		});
	},
	create: function(req, res) {
		var params = req.params.all();

		// write to file
		var moment = require('moment');
		var timestamp = moment().format('MMMM_DD_YYYY_HHmmSSS');
		var imgdata = req.param('data');
	
		var base64Data = imgdata.replace(/^data:image\/png;base64,/,'');

		require("fs").writeFile(PhotoController.dataPath + '/' + timestamp + '.png', base64Data, 'base64', function(err) {
		  console.log(err);
		});
		
		res.json(true);
	}
	
};

module.exports = PhotoController;