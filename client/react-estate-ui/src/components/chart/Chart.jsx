import { useState } from "react";
import "./chart.scss"; // Fixed the import file name typo

function Chat() {
    // Initialized as null to start with just the message list. Clicking a user opens that specific chat box.
    const [chat, setChat] = useState(null); 

    const handleOpenChat = (userProfile) => {
        setChat({
            id: userProfile.id,
            name: userProfile.name,
            avatar: userProfile.avatar
        });
    };

    return (
        <div className="chat">
            {/* The Left Hand Section: Chat user lists thread layout container */}
            <div className="messages-list-wrapper">
                <h1>Messages</h1>
                
                <div className="message-card" onClick={() => handleOpenChat({ id: 1, name: "John Doe", avatar: "/pet.png" })}>
                    <img src="/pet.png" alt="User Avatar" />
                    <span className="user-name">John Doe</span>
                    <p className="latest-message-snippet">Is the dynamic marketplace posting blueprint ready yet?</p>
                </div>

                <div className="message-card" onClick={() => handleOpenChat({ id: 2, name: "Alice Smith", avatar: "/pet.png" })}>
                    <img src="/pet.png" alt="User Avatar" />
                    <span className="user-name">Alice Smith</span>
                    <p className="latest-message-snippet">Let us run an end-to-end user identity test today.</p>
                </div>
            </div>

            {/* The Right Hand Section: Live conversation tracking box container wrapper */}
            {chat && (
                <div className="chat-box-container">
                    <div className="chat-header-bar">
                        <div className="active-user-meta">
                            <img src={chat.avatar} alt={chat.name} />
                            <span>{chat.name}</span>
                        </div>
                        <button className="close-panel-btn" onClick={() => setChat(null)}>✕</button>
                    </div>

                    <div className="conversation-scroller-view">
                        <div className="chat-bubble">
                            <p>Hello! I am inquiring about the listing parameters for the duplex house.</p>
                            <span className="timestamp">10:42 PM</span>
                        </div>

                        <div className="chat-bubble own">
                            <p>Greetings! The listing details are completely active and verified.</p>
                            <span className="timestamp">10:45 PM</span>
                        </div>
                    </div>

                    <form className="chat-input-action-bar" onSubmit={(e) => e.preventDefault()}>
                        <textarea placeholder="Type a message layout..." required></textarea>
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chat;
