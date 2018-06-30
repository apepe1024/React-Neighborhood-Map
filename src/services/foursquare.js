// I wanted to use this to load venues asynchronously and dynamically so that each time a user loaded the app it would pull different venues, but it kept returning rather...salacious...results if left to its own devices. So I had to vet each result and make sure it was appropriate to be used. I learned a lot about my neighborhood though I guess. ¯\_(ツ)_/¯

// node-fetch, just used on the command line, results copypasted into venuelist.js, and exported into App.js
const fetch = require('node-fetch');

//one long url string because lat and lng are hard coded, didn't have to get them off of the marker dynamically like I did in App.js
fetch(`https://api.foursquare.com/v2/venues/search?ll=39.89967,-74.939676&client_id=NDVMP505KC1MB1R0N0EUOFDP5NMBEQEAT4WVVHAK3ETD5GE5&client_secret=01DVOAP1Y35MOHRBSQEVZGJOKQ0KYES4DQWDIVLMNUJ3SPNT&intent=browse&radius=1000&limit=20&v=20180624`)
  .then(response => response.json())
  .then(body => {
    let businesses = [];
    for (let i = 0; i < body.response.venues.length; i++) {
      let business = {
        id: body.response.venues[i].id,
        name: body.response.venues[i].name,
        latitude: body.response.venues[i].location.lat,
        longitude: body.response.venues[i].location.lng
      };
      businesses.push(business);
    }
    console.log(businesses);
  }).catch(e => {
    console.log(e);
});
