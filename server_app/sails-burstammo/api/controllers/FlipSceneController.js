/**
 * FlipSceneController
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
var flipSceneAssetPath = './assets/data/flipscenes',    
	fs = require('fs');

var FlipSceneController = {
	index: function(req, res) {
		// gets a list of json files that describe each flip scene
		var flipSceneList = [];

		fs.readdir(flipSceneAssetPath, function(err, files) {
			for(var i=0; i<files.length; i++) {
				fs.readFile(flipSceneAssetPath + '/' + files[i], function(err, data) {
					flipSceneList.push(JSON.parse(data));
				});
			}
		});

		res.json(flipSceneList);
	},
	create: function(req, res) {
		// do do, allows the web app to create a new flip scene with a list of photos
		// creates a json file containing list of photos

	},
	update: function(req, res) {

	},
	destroy: function(req, res) {

	},

	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to FlipSceneController)
	*/
	_config: {}
};

module.exports = FlipSceneController;
