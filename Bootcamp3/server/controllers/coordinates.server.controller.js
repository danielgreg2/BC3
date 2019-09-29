var config = require('../config/config'), 
    request = require('request');
//required to use opencage API
const opencage = require('opencage-api-client');



module.exports = function(req, res, next) {
  if(req.body.address) {
      //This code just formats the address so that it doesn't have space and commas using escape characters
      var addressTemp = req.body.address;
      var addressTemp2 = addressTemp.toLowerCase();
      var addressTemp3 = addressTemp2.replace(/\s/g, "%20");
      var addressTemp4 = addressTemp3.replace(/,/g , "%2C");
      
    //Setup your options q and key are provided. Feel free to add others to make the JSON response less verbose and easier to read 
    var options = { 
      q: addressTemp4,
      key: config.openCage.key,  
    }

    //Setup your request using URL and options - see ? for format
    request({
      url: 'https://api.opencagedata.com/geocode/v1/json', 
      qs: options
      }, function(error, response, body) {
		opencage.geocode({q: options.q, key: options.key}).then(data => {
			//console.log(JSON.stringify(data));
			//For ideas about response and error processing see https://opencagedata.com/tutorials/geocode-in-nodejs
				if (data.status.code == 200) {
					//Below is just debugging that prints to console the area and coordinates of address
					if (data.results.length > 0) {
					  var place = data.results[0];
					  console.log(place.formatted);
					  console.log(place.geometry);
					}
				} else if (data.status.code == 402) {
					//This error occurs if I have used too many free trials of the API
					console.log('hit free-trial daily limit');
					console.log('become a customer: https://opencagedata.com/pricing'); 
				} else {
					// other possible response codes:
					// https://opencagedata.com/api#codes
					console.log('error', data.status.message);
				}
			//Saves the coordinates of the address into "req.results"
			req.results = data.results[0].geometry;
			next();
			}).catch(error => {
				console.log('error', error.message);
			});
        
        //JSON.parse to get contents. Remember to look at the response's JSON format in open cage data
        
        /*Save the coordinates in req.results -> 
          this information will be accessed by listings.server.model.js 
          to add the coordinates to the listing request to be saved to the database.

          Assumption: if we get a result we will take the coordinates from the first result returned
        */
    });
  } else {
    next();
  }
};  
