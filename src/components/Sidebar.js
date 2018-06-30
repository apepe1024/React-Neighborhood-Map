import React, {Component} from 'react';
import VenueItem from './VenueItem';

class Sidebar extends Component {
    //initial state
    constructor(props) {
        super(props);
        this.state = {
            'venues': '',
            'queryString': ''
        };
        this.filterVenues = this.filterVenues.bind(this);
    }

    // set state for Sidebar component to receive props before mount
    componentWillMount() {
        this.setState({
            'venues': this.props.venuelist
        });
    }

    // on mount, init nifty focus trap to prevent focus from escaping onto map
    componentDidMount() {
        let focusTrap = document.getElementsByClassName('sidebar');
        focusTrap[0].addEventListener('transitionend', (e) => {
          focusTrap[0].focus();
        })
    }

    // filterVenues function; closes InfoWindow on keyup, if matches, hides nonmatches
    filterVenues(event) {
        this.props.closeInfoWindow();
        const {value} = event.target;
        let venues = [];
        this.props.venuelist.forEach(function (venue) {
            if (venue.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                venue.marker.setVisible(true);
                venues.push(venue);
            } else {
                venue.marker.setVisible(false);
            }
        });
        this.setState({
            'venues': venues,
            'queryString': value
        });
    }
    
    // render Sidebar component
    render() {
        // returns list of VenueItems
        let venuelist = this.state.venues.map(function (listItem, index) {
            return (
                <VenueItem key={index} openInfoWindow={this.props.openInfoWindow.bind(this)} data={listItem}/>
            );
        }, this);

        return (
            <div className="sidebar" tabIndex="0">
                <input role="search" aria-labelledby="search" id="search" className="search" type="text" placeholder="Search Venues" tabIndex="0"
                       value={this.state.queryString} onChange={this.filterVenues}/>
                <ul tabIndex="0">
                    {venuelist}
                </ul>
            </div>
        );
    }
}

export default Sidebar;
