//import React from 'react';
//import { Marker, Popup, Link } from 'react-leaflet';
//import { Link } from "react-router-dom";
//import L from 'leaflet';
//import './pin.scss'; // Clean styling file for your popup layout

// Setup stable marker assets globally


function Pin({ item }) {
  // Crash protection guard clause
  if (!item.latitude || !item.longitude) return null;

  return (
    <Marker position={[item.latitude, item.longitude]} icon={customIcon}>
      <Popup>
        <div className="popupContainer">
            <Link to={`/${item.id}`}>
                <img src={item.img} alt="" />
                <img src={item.img} alt={item.title} className="popupImage" />
            </Link>
          <img src={item.img} alt={item.title} className="popupImage" />
          <div className="popupTextContainer">
            <h4 className="popupTitle">{item.title}</h4>
            <span className="popupSpecs">
              {item.bedroom} bed | {item.bathroom} bath
            </span>
            <b className="popupPrice">${item.price}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

//export default Pin;
