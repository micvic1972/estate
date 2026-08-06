import Card from "../../components/card/Card";
import Filter from "../../components/filter/Filter";
import Map from "../../components/map/Map";
import { listData } from "../../lib/dummydata";
import "./listpage.scss";

function Listpage() {
  const data = listData;

  return (
    <div className="listpage-viewport-wrapper">
      
      {/* Primary listings data column module container */}
      <div className="listcontainer-panel">
        <div className="wrapper-inner-box">
          <Filter />
          <div className="cards-stack-layout">
            {data.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Standalone geolocation mapping viewport module container */}
      <div className="mapcontainer-panel">
        <Map items={data} />
      </div>

    </div>
  );
}

export default Listpage;
