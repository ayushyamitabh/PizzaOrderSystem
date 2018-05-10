import React, { Component } from 'react';

export default class GuestView extends Component {
    constructor(props){
        super(props);
        console.log(this.props.match.params.orderID)
    }
    render() {
        return (
            <div>
            guest view
            </div>
        );
    }
}