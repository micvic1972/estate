// Listpage.jsx
import Card from "../../components/card/Card";
import Filter from "../../components/filter/Filter";
import Map from "../../components/map/Map";
import { listData } from "../../lib/dummydata";
import "./listpage.scss";

function Listpage() {
  const data = listData;

  return (
    <div className="listpage">
      <div className="listcontainer">
        <div className="wrapper">
          <Filter />
          <div className="cards">
            {data.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
          <div className="spacer"></div>
        </div>
      </div>
      <div className="mapcontainer">
        <Map items={data} />
      </div>
    </div>
  );
}

export default Listpage;

