import "./list.scss"
import { listData } from "../../lib/dummydata"
import Card from "../card/Card"

function List() {

    
    return (
        <div className="list">
          <div className="wrapper">
            
            {listData.map(item => (
              <Card key={item.id} item={item}/>
            ))}
          </div>
        </div>
    )
}

export default List