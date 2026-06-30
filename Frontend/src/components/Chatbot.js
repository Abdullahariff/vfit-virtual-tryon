import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const API_BASE = 'http://127.0.0.1:8001';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your VFit AI Stylist. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const chatEndRef = useRef(null);

    // Naye message par auto-scroll karne ke liye
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // 1. User ka message screen par dikhao
        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        const systemFormatNote =
            "\n[System Note: You must respond EXACTLY in the 3-section format: Recommendation, Why, and Image_Path. Do not use markdown bolding in the keys.]";

        try {
            // ==================== [SECURITY LAYER: TOKEN EXTRACTION] ====================
            // Browser ki local storage se Supabase ka auth data key name se uthaya
            const supabaseAuthKey = "sb-lxtmkopvywsnbmbffmlx-auth-token"; 
            const sessionDataString = localStorage.getItem(supabaseAuthKey);
            
            if (!sessionDataString) {
                throw new Error("User session not found. Please log in first.");
            }

            // String data ko JSON object me parse kiya aur active access_token nikaala
            const sessionData = JSON.parse(sessionDataString);
            const token = sessionData?.access_token;

            if (!token) {
                throw new Error("Access token missing. Authentication failed.");
            }
            // ============================================================================

            const response = await fetch(`${API_BASE}/ask-stylist`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Gateway lock kholne k liye token Authorization header me bhej diya
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: currentInput + systemFormatNote,
                    session_id: "abdullah_session", // Backend pr ye auto overwite ho jayega user.id se
                }),
            });

            if (!response.ok) {
                throw new Error(`Stylist API error: ${response.status}`);
            }

            const data = await response.json();

            const botMsg = {
                recommendation: data.recommendation,
                why: data.why,
                imageUrl: data.image_url, // explicitly using imageUrl
                sender: 'bot'
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { 
                text: `Authentication or connection issue: ${error.message}. Please ensure you are logged in.`, 
                sender: 'bot' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <span>VFit AI Assistant</span>
                        <button onClick={() => setIsOpen(false)} style={{cursor:'pointer', background:'none', border:'none', color:'white', fontSize:'20px'}}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message-bubble ${msg.sender}`}>
                                <div className="bubble-content">
                                    {msg.sender === 'bot' ? (
                                        <div className="bot-message-content">
                                            {msg.imageUrl && (
                                                <img
                                                    src={msg.imageUrl}
                                                    alt="Outfit"
                                                    className="msg-img"
                                                    style={{ display: 'block', width: '150px', height: '150px', objectFit: 'cover', marginBottom: '10px', borderRadius: '8px' }}
                                                />
                                            )}
                                            {msg.recommendation ? (
                                                <strong className="msg-recommendation">{msg.recommendation}</strong>
                                            ) : null}
                                            {(msg.why || msg.text) ? (
                                                <p className="msg-why">{msg.why || msg.text}</p>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="loading">AI is thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="chat-footer">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about dresses..." 
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}

            {/* Chat Floating Icon */}
            <div className="chat-button" onClick={() => setIsOpen(!isOpen)}>
                💬
            </div>
        </div>
    );
};

export default Chatbot;