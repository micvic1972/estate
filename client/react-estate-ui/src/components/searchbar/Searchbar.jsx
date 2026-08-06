import { useState } from "react"
import "./searchbar.scss"

const types = ["buy", "rent"];
function Searchbar() {
    const [query, setquery] = useState({
        type:"buy",
        location:"",
        minPrice:0,
        maxPrice:0,
    });
    //this handle movement on the button
    const switchtype = (val) => {
        setquery((prev) => ({ ...prev, type: val}));
    };
    return (
        <div className="searchbar">
            <div className="type">
                
                {types.map((type) => (
                    <button key={type} onClick={() => switchtype(type)} className={query.type === type ? "active" : ""}> {type}</button>
                ))}
            </div>
            <form>
                <input type="text" name="location" placeholder="omo even me tire oo" />
                <input type="text" name="location" placeholder="city location" />
                <input type="number" name="minprice" min={0} max={1000000000} placeholder="Min price" />
                <button>
                    <img src="/search.png" alt="" />
                </button>  
            </form>
            
            
        </div>
    )
}

export default Searchbar