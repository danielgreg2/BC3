
/* Dependencies */
var mongoose = require('mongoose'), 
    Listing = require('../models/listings.server.model.js'),
    coordinates = require('./coordinates.server.controller.js');
    
/*
  In this file, you should use Mongoose queries in order to retrieve/add/remove/update listings.
  On an error you should send a 404 status code, as well as the error message. 
  On success (aka no error), you should send the listing(s) as JSON in the response.

  HINT: if you are struggling with implementing these functions refer back to this tutorial 
  https://www.callicoder.com/node-js-express-mongodb-restful-crud-api-tutorial/
  or
  https://medium.com/@dinyangetoh/how-to-build-simple-restful-api-with-nodejs-expressjs-and-mongodb-99348012925d
  

  If you are looking for more understanding of exports and export modules - 
  https://www.sitepoint.com/understanding-module-exports-exports-node-js/
  or
  https://adrianmejia.com/getting-started-with-node-js-modules-require-exports-imports-npm-and-beyond/
 */

/* Create a listing */
exports.create = function(req, res) {

  /* Instantiate a Listing */
  var listing = new Listing(req.body);

  /* save the coordinates (located in req.results if there is an address property) */
  if(req.results) {
    listing.coordinates = {
      latitude: req.results.lat, 
      longitude: req.results.lng
    };
  }
 
  /* Then save the listing */
  listing.save(function(err) {
    if(err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(listing);
      console.log(listing)
    }
  });
};

/* Show the current listing */
exports.read = function(req, res) {
  /* send back the listing as json from the request */
  res.json(req.listing);
};

/* Update a listing - note the order in which this function is called by the router*/
exports.update = function(req, res) {
	var listing = req.listing;
	//console.log(listing._id);

	//Find the listing with the ID we want to update
	Listing.findByIdAndUpdate(listing._id, req.body, {new: true}, function(err, listing2){
		//Check for errors
		if (err)
			res.status(404).send(err);
			
		/* Replace the listings's properties with the new properties found in req.body */
		listing2 = req.body;
		listing2._id = listing._id;
		
		/*save the coordinates (located in req.results if there is an address property) */
		if (req.results){
			//Debugging that prints to console the coordinates before they are saved to the listing
			//console.log("You have reached the saving coordinates code");
			//console.log(req.results);
			
			//Saves latitude and longitude of address to the listing's coordinates field
			listing2.coordinates = {
				latitude: req.results.lat, 
				longitude: req.results.lng
			};
		}
		/* Save the listing */
		listing.save(function(err){
			//check for errors
			if (err)
				res.status(404).send(err);
			res.json(listing2);
		});
	});	
};

/* Delete a listing */
exports.delete = function(req, res) {
  var listing = req.listing;

  /* Add your code to remove the listing */

	Listing.findByIdAndRemove(listing, function(err){
		//Checks if the listing exists in the database
		if (!listing){
			res.status(404).json({
				message: "Listing not found"
			});
		}
		//Catch for all errors
		if (err)
			res.send(err);
		//If deletes successfully, send OK response
		res.json({
			message: "Listing successfully delected"
		});
	});
};

/* Retreive all the directory listings, sorted alphabetically by listing code */
exports.list = function(req, res) {
  /* Add your code */
	//This uses the Listing schema already defined and returns all listings of that schema in a variable called 'listings'
	Listing.find(function(err, listings){
		//This will catch any errors and send the correct error response
		if (err)
			res.send(err);
		//Will send all listings to the server
		res.json(listings);
		});
};

/* 
  Middleware: find a listing by its ID, then pass it to the next request handler. 

  HINT: Find the listing using a mongoose query, 
        bind it to the request object as the property 'listing', 
        then finally call next
 */
exports.listingByID = function(req, res, next, id) {
  Listing.findById(id).exec(function(err, listing) {
    if(err) {
      res.status(400).send(err);
    } else {
      req.listing = listing;
      next();
    }
  });
};
