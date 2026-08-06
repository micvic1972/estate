import Searchbar from "../../components/searchbar/Searchbar"
import { AuthContext } from "../../context/AuthContext"
import "./homepage.scss"
import { useContext } from "react"

function Homepage() {
    ///this is what used and enhance data sharing to other file from db of a user at all
    const {currentUser} = useContext(AuthContext)
    console.log(currentUser)
    return (
        <div className="homepage">
            <div className="textcontainer">
                <div className="wrapper">
                    <h1 className="title">
                        The Brain Has The Lagging part and Workable Part
                    </h1>
                    <p>
                        The most important thing in planning is planning your plan
                        does not go as planned
                    </p>
                    <Searchbar />
                    <div className="boxes">
                        <div className="box">
                            <h1>200</h1>
                            <h2>Award winning</h2>
                        </div>
                        <div className="box">
                            <h1>2000</h1>
                            <h2>maybe it winning</h2>
                        </div>
                        <div className="box">
                            <h1>2000</h1>
                            <h2>maybe it winning</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className="imagecontainer">
                <img src="bg.png" alt="" />
            </div>
        </div>
    )
}

export default Homepage