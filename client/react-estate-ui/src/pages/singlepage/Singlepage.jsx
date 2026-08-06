import "./singlepage.scss";
import Slider from "../../components/slider/Slider";
import { singlepostData, userData } from "../../lib/dummydata";
import Map from "../../components/map/Map";

function Singlepage() {
  return (
    <div className="singlepage">
      {/* Left: Details */}
      <div className="details">
        <div className="details-wrapper">
          <Slider images={singlepostData.image} />
          <div className="info">
            <div className="info-top">
              <div className="post">
                <h1>{singlepostData.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{singlepostData.address}</span>
                </div>
                <div className="price">${singlepostData.price}</div>
              </div>
              <div className="user">
                <img src={userData.img} alt="" />
                <span>{userData.name}</span>
              </div>
            </div>
            <div className="description">
              {singlepostData.description}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Features */}
      <div className="features">
        <div className="features-wrapper">
          <p className="section-title">General</p>
          <div className="list-vertical">
            <div className="feature-item">
              <img src="/utility.png" alt="" />
              <div className="feature-text">
                <span>Utilities</span>
                <p>Rental is responsible</p>
              </div>
            </div>
            <div className="feature-item">
              <img src="/pet.png" alt="" />
              <div className="feature-text">
                <span>Pet Policy</span>
                <p>Pet is allowed</p>
              </div>
            </div>
            <div className="feature-item">
              <img src="/fee.png" alt="" />
              <div className="feature-text">
                <span>Property fees</span>
                <p>Must have 3x the rent in total household income</p>
              </div>
            </div>
          </div>

          <p className="section-title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>80 sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>2 beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>1 bathroom</span>
            </div>
          </div>

          <p className="section-title">Nearby Places</p>
          <div className="list-horizontal">
            <div className="feature-item">
              <img src="/school.png" alt="" />
              <div className="feature-text">
                <span>School</span>
                <p>250m away</p>
              </div>
            </div>
            <div className="feature-item">
              <img src="/bus.png" alt="" />
              <div className="feature-text">
                <span>Bus stop</span>
                <p>100m away</p>
              </div>
            </div>
            <div className="feature-item">
              <img src="/restaurant.png" alt="" />
              <div className="feature-text">
                <span>Restaurant</span>
                <p>200m away</p>
              </div>
            </div>
          </div>

          <p className="section-title">Location</p>
          <div className="map-box">
            <Map />
          </div>

          <div className="buttons">
            <button>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button>
              <img src="/save.png" alt="" />
              Save the Place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Singlepage;