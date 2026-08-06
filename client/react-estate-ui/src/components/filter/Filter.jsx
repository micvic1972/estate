// Filter.jsx
import "./filter.scss";

function Filter() {
  return (
    <div className="filter">
      <h1>Search results for <b>London</b></h1>
      <div className="top">
        <div className="item">
          <label htmlFor="city">Location</label>
          <input type="text" id="city" name="city" placeholder="City" />
        </div>
      </div>
      <div className="bottom">
        <div className="item">
          <label htmlFor="type">Type</label>
          <select name="type" id="type">
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </div>
        <div className="item">
          <label htmlFor="property">Property</label>
          <select name="property" id="property">
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
          </select>
        </div>
        <div className="item">
          <label htmlFor="minprice">Min Price</label>
          <input type="text" id="minprice" name="minprice" placeholder="Min price" />
        </div>
        <div className="item">
          <label htmlFor="maxprice">Max Price</label>
          <input type="text" id="maxprice" name="maxprice" placeholder="Max price" />
        </div>
        <div className="item">
          <label htmlFor="bedrooms">Bedrooms</label>
          <input type="text" id="bedrooms" name="bedrooms" placeholder="Bedrooms" />
        </div>
        <button>
          <img src="/search.png" alt="Search" />
        </button>
      </div>
    </div>
  );
}

export default Filter;