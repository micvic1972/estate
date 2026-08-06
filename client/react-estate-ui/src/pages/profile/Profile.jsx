import { useNavigate } from "react-router-dom";
import Chat from "../../components/chart/Chart";
import List from "../../components/list/List";
import apiReguest from "../../lib/apiRequest";
import "./profile.scss";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react"; // 🚀 FIXED: Added missing hook import to read context

function Profile() {
    const navigate = useNavigate();
    //FIXED: Tune into your global broadcast bubble to pull out the live data and updater function
    const { currentUser, updateUser } = useContext(AuthContext);
    const handlelogout = async () => {
        try {
            await apiReguest.post("/auth/logout");
            // FIXED: Use the context updater to set the global bubble to null.
            // This alerts the Navbar, local storage, and all components to log out instantly!
            updateUser(null); 
            navigate("/");
        } catch (err) { 
            console.error("[LOGOUT TRACKING ERROR]", err);
        }
    };
    return (
        <div className="profile">
            <div className="details">
                <div className="wrapper">
                    <div className="title">
                        <h1>User Information</h1>
                        <button>Update Profile</button>
                    </div>
                    <div className="info">
                        <span>
                            Avatar:
                            {/*fIXED: Display user avatar from database, or fallback to default if blank */}
                            <img src={currentUser?.avatar || "/noavatar.png"} alt="User Avatar" />
                        </span>
                        {/*FIXED: Switched placeholders to display real dynamic data from context */}
                        <span>Username: <b>{currentUser?.name || currentUser?.username}</b></span>
                        <span>Email: <b>{currentUser?.email}</b></span>
                        
                        <button onClick={handlelogout}>Logout</button>
                    </div>
                    <div className="title">
                        <h1>My List</h1>
                        <button>Create New Post</button>
                    </div>
                    <List/>
                    <div className="title">
                        <h1>Saved List</h1>
                    </div>
                   <List/>
                </div>
            </div>
            <div className="chatcontainer">
                <div className="wrapper">
                    <Chat/>
                </div>
            </div>
        </div>
    );
}

export default Profile;
