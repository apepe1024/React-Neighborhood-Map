import React, { Component } from 'react';
import Sidebar from './Sidebar';
// venuelist and mapStyles in separate files, generated from Maps and Foursquare APIs
import { venuelist } from '../services/venuelist.js';
import { mapStyles } from '../services/mapStyles.js';
// package that allows for lazy loading scripts in export call
import scriptLoader from 'react-async-script-loader';

class App extends Component {
    //initial state
    constructor(props) {
        super(props);
        this.state = {
            'venuelist': venuelist,
            'map': '',
            'infowindow': '',
            'stopbouncingdude': '',
            'maploaded': false,
            'scripterror': false
        };
        // binding 'this' instances
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {

      // update state on successful mount
      this.setState({
          'maploaded': true
      });

      // set initMap() function equal to global window context
      window.initMap = this.initMap;
    }

    componentDidCatch() {

      // pass state to conditional rendering error handler
      this.setState({scripterror: true});
    }

    initMap() {
        // 'this' alias
       let _self = this;

        // hooking into #map and generating the map itself
        let mapHook = document.getElementById('map');
        let map = new window.google.maps.Map(mapHook, {
            center: {lat: 39.89967, lng: -74.936679},
            zoom: 15,
            mapTypeControl: false,
            styles: mapStyles
        });

        // init InfoWindow
        let InfoWindow = new window.google.maps.InfoWindow({});

        // update state
        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        // keeps map centered if window size changes
        window.google.maps.event.addDomListener(window, "resize", function () {
            let center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            _self.state.map.setCenter(center);
        });

        // calls closeInfoWindow function on InfoWindow 'x' click
        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            _self.closeInfoWindow();
        });

        // calls closeInfoWindow function on click outside of InfoWindow
        window.google.maps.event.addListener(map, 'click', function () {
            _self.closeInfoWindow();
        });

        // generating Markers for each venue in venuelist
        let venuelist = [];
        this.state.venuelist.forEach(function (venue) {
            let name = venue.name;
            let marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(venue.latitude, venue.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map,
                icon: {
                  url: './pin.svg',
                  scaledSize: new window.google.maps.Size(64, 64)
                }
            });

            // calls openInfoWindow function on click
            marker.addListener('click', function () {
                _self.openInfoWindow(marker);
            });
            venue.name = name;
            venue.marker = marker;
            venue.display = true;
            venuelist.push(venue);
        });
        this.setState({
            'venuelist': venuelist
        });
    }

    // openInfoWindow function; sets window and map centering, offset for the latter, calls closeInfoWindow on a previously open InfoWindow if there was one, sets preliminary content while content is loading, starts Marker bouncing, sets focus to read-more link on content load, updates state, calls getMarkerInfo function
    openInfoWindow(marker) {
        window.scroll(0, 0)
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'stopbouncingdude': marker
        });
        this.getMarkerInfo(marker);
        window.google.maps.event.addListener(this, 'domready', function () {
            document.getElementById('read-more').focus();
        });
    }

    // closeInfoWindow function; sets Marker animation to null, updates state, closes InfoWindow
    closeInfoWindow() {
        if (this.state.stopbouncingdude) {
            this.state.stopbouncingdude.setAnimation(null);
        }
        this.setState({
            'stopbouncingdude': ''
        });
        this.state.infowindow.close();
    }

    //fetch data from foursquare dynamically to set in InfoWindow on VenueItem or marker click
    getMarkerInfo(marker) {
        // 'this' alias
        let _self = this;
        // foursquare keys
        let clientId = `${process.env.REACT_APP_FOURSQUARE_API_ID}`;
        let clientSecret = `${process.env.REACT_APP_FOURSQUARE_API_SECRET}`;
        // piece url together
        let url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20180625&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        // GET, jsonify, concatenate, setContent in InfoWindow
        fetch(url)
            .then(
                function (response) {
                  if (response.status !== 200) { throw response.err; }
                    response.json().then(function (data) {
                        let name = '<h3>' + data.response.venues[0].name + '</h3>';
                        let address = '<p>' + data.response.venues[0].location.address + '<br>' +  data.response.venues[0].location.city + ', ' +  data.response.venues[0].location.state + ' ' +
                        data.response.venues[0].location.postalCode + '</p>';
                        let readMore = '<p class="read-more">Read More on the</p><a href="https://foursquare.com/v/'+ data.response.venues[0].id +'" target="_blank">Foursquare Page!</a>';
                        _self.state.infowindow.setContent(name + address + readMore);
                    });
                }
            )
            .catch(function (err) {
                _self.state.infowindow.setContent("Error fetching the data! Try again later.");
            });
    }

    // render the whole thing
    render() {
        // error handling variables for map
        const isMapLoaded = this.state.maploaded;
        const isError = this.state.scripterror;
        //conditional rendering based on script load error
        if (isError) {
          return (<div id="script-error" className="error" role="alert">
                    <h3>Google Maps timed out! Try again later.</h3>
                  </div>)
        } else {
        return (
            <div className="App">

                <header className="App-header" tabIndex="-1">
                  <img src="./logo.svg" className="App-logo" alt="logo" tabIndex="-1"/>
                  <h1 tabIndex="-1">React Neighborhood Map</h1>
                </header>

                <Sidebar key="100" venuelist={this.state.venuelist} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>

                <div className="map-container" tabIndex="-1">
                  { isMapLoaded
                    ?
                    <div id="map" tabIndex="-1"></div>
                    :
                    <div className="loading-map">
                        <h3>Loading Google Maps!</h3>
                        <img src='./pin.svg' className="s-pin" alt="loading indicator" />
                    </div> }
                </div>

                <footer className="App-footer" tabIndex="-1">
                  <h2 tabIndex="-1">by Alessandro Pepe, June 2018</h2>
                </footer>
            </div>
        );
      }
    }
}

// scriptLoader call from react-async-script-loader
// including the initMap callback in the url triggers that callback upon load
export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&callback=initMap`]
)(App);
