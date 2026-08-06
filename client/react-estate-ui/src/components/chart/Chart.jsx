import { useState } from "react"
import "./chart.scss"


function Chat () {
    const [chat, setchat] = useState(true)
    return (
        <div className="chat">
            <div className="messages">
                <h1>Messages</h1>
                <div className="message">
                    <img src="/pet.png" alt="" />
                    <span>John Doe</span>
                    <p>biko just confuse</p>
                </div>
                <div className="message">
                    <img src="/pet.png" alt="" />
                    <span>John Doe</span>
                    <p>biko just confuse</p>
                </div>
                <div className="message">
                    <img src="/pet.png" alt="" />
                    <span>John Doe</span>
                    <p>biko just confuse</p>
                </div>
                <div className="message">
                    <img src="/pet.png" alt="" />
                    <span>John Doe</span>
                    <p>biko just confuse</p>
                </div>
                <div className="message">
                    <img src="/pet.png" alt="" />
                    <span>John Doe</span>
                    <p>biko just confuse</p>
                </div>
            </div>
            {chat &&<div className="chatBox">
                <div className="top">
                    <div className="user">
                        <img src="/pet.png" alt="" />
                        checking user
                      
                    </div>
                    <span className="close" onClick={() => setchat(null)}>X</span>
                </div>
                <div className="center">
                    <div className="chatMessage">
                        <p>jhvbandcjghvbasd gjbmnbcugjhqvmsnmbmf hkbvbdkqwvdjhqwbd,j</p>
                        <span>1 hrs</span>
                    </div>
                      <div className="chatMessage own">
                        <p>jhvbandcjghvbasd gjbmnbcugjhqvmsnmbmf hkbvbdkqwvdjhqwbd,j</p>
                        <span>1 hrs</span>
                    </div>
                      <div className="chatMessage">
                        <p>jhvbandcjghvbasd gjbmnbcugjhqvmsnmbmf hkbvbdkqwvdjhqwbd,j</p>
                        <span>1 hrs</span>
                    </div>
                      <div className="chatMessage own">
                        <p>jhvbandcjghvbasd gjbmnbcugjhqvmsnmbmf hkbvbdkqwvdjhqwbd,j</p>
                        <span>1 hrs</span>
                    </div>
                      <div className="chatMessage">
                        <p>jhvbandcjghvbasd gjbmnbcugjhqvmsnmbmf hkbvbdkqwvdjhqwbd,j</p>
                        <span>1 hrs</span>
                    </div>
                      <div className="chatMessage own">
                        <p>jhvbandcjghvbasd gjbmnbcugjhqvmsnmbmf hkbvbdkqwvdjhqwbd,j</p>
                        <span>1 hrs</span>
                    </div>
                </div>
                <div className="botton">
                    <textarea name="" id=""></textarea>
                    <button>Send</button>
                </div>
            </div>}
        </div>
    )
}

export default Chat
