import React, { Component } from 'react';

//  content and props for each item in Sidebar component
class VenueItem extends Component {

    // render VenueItem component
    render() {
        return (
            <li role="button" className="venue-item" tabIndex="0" onKeyPress={this.props.openInfoWindow.bind(this, this.props.data.marker)} onClick={this.props.openInfoWindow.bind(this, this.props.data.marker)}><p>{this.props.data.name}</p></li>
        );
    }
}

export default VenueItem;
