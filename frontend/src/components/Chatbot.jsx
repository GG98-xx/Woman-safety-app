import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBpIcca_RdEH7P7LcFdOOjQZSptd6HQ2so');

const SYSTEM_PROMPT = `You are SafeHer AI, a compassionate and helpful safety assistant for women on the SafeHer platform - a Women Safety and Incident Reporting System in India.

Your role is to:
1. Help women who feel unsafe or are in dangerous situations
2. Guide them on how to report incidents on the platform
3. Provide safety tips and advice
4. Offer emotional support in scary situations
5. Help them understand their rights
6. Guide them to emergency services when needed

Key information about the platform:
- Users can report incidents (harassment, assault, stalking, threats, domestic violence)
- Users can send community alerts to nearby people
- There's an SOS button (bottom right) for emergencies
- Users can call 112 for police emergencies in India
- Women's helpline in India: 1091
- Domestic violence helpline: 181
- Emergency: 112

Always be:
- Empathetic and non-judgmental
- Clear and concise
- Focused on safety
- Encouraging them to seek help
- Available in both English and Hinglish

Never:
- Dismiss their concerns
- Be preachy or lecture them
- Share personal opinions on politics
- Go off topic from safety and wellbeing

Keep responses short (2-4 sentences max) unless they need detailed guidance.`;

export default function Chatbot() {
    const [open,     setOpen]     = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: "Hi! I'm SafeHer AI 🛡️ I'm here to help you stay safe. How can I help you today?",
            time: new Date()
        }
    ]);
    const [input,   setInput]   = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const chatRef   = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        const userMsg = { role: 'user', text, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));

            const chat = model.startChat({
                history: [
                    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
                    { role: 'model', parts: [{ text: "Understood. I'm SafeHer AI, ready to help." }] },
                    ...history
                ]
            });

            const result = await chat.sendMessage(text);
            const response = result.response.text();
            setMessages(prev => [...prev, { role: 'assistant', text: response, time: new Date() }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "I'm having trouble connecting right now. If you're in danger, please call 112 immediately! 🆘",
                time: new Date()
            }]);
        }
        setLoading(false);
    };

    const quickReplies = [
        "I feel unsafe right now",
        "How do I report an incident?",
        "What is the women's helpline?",
        "Someone is following me",
    ];

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            {/* Chat button */}
            <motion.button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'fixed', bottom: '32px', left: '32px',
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                    border: 'none', cursor: 'pointer', zIndex: 998,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', boxShadow: '0 4px 20px rgba(255,77,136,0.4)',
                }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}>
                {open ? '✕' : '💬'}
            </motion.button>

            {/* Chat window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'fixed', bottom: '104px', left: '32px',
                            width: '340px', height: '500px',
                            background: 'white', borderRadius: '24px',
                            boxShadow: '0 16px 48px rgba(255,77,136,0.2)',
                            border: '1px solid #ffe0ec',
                            display: 'flex', flexDirection: 'column',
                            zIndex: 997, overflow: 'hidden'
                        }}>

                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                            padding: '16px 20px',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <motion.div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px'
                            }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}>
                                🛡️
                            </motion.div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>SafeHer AI</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                                    Always here for you
                                </div>
                            </div>
                            <motion.a href="tel:112"
                                style={{
                                    marginLeft: 'auto', background: 'rgba(255,255,255,0.2)',
                                    color: 'white', padding: '6px 12px', borderRadius: '10px',
                                    textDecoration: 'none', fontSize: '12px', fontWeight: 700
                                }}
                                whileHover={{ background: 'rgba(255,255,255,0.3)' }}>
                                📞 112
                            </motion.a>
                        </div>

                        {/* Messages */}
                        <div ref={chatRef} style={{
                            flex: 1, overflowY: 'auto', padding: '16px',
                            display: 'flex', flexDirection: 'column', gap: '12px'
                        }}>
                            {messages.map((msg, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        alignItems: 'flex-end', gap: '8px'
                                    }}>
                                    {msg.role === 'assistant' && (
                                        <div style={{
                                            width: 28, height: 28, minWidth: 28,
                                            background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                            borderRadius: '50%', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                                        }}>🛡️</div>
                                    )}
                                    <div>
                                        <div style={{
                                            maxWidth: '220px', padding: '10px 14px',
                                            borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: msg.role === 'user' ? 'linear-gradient(135deg, #ff4d88, #e6005c)' : '#f9fafb',
                                            color: msg.role === 'user' ? 'white' : '#374151',
                                            fontSize: '13px', lineHeight: 1.5,
                                            border: msg.role === 'assistant' ? '1px solid #f3f4f6' : 'none'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{
                                            fontSize: '10px', color: '#9ca3af', marginTop: '4px',
                                            textAlign: msg.role === 'user' ? 'right' : 'left'
                                        }}>
                                            {formatTime(msg.time)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: 28, height: 28, background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                                    }}>🛡️</div>
                                    <div style={{
                                        padding: '10px 14px', background: '#f9fafb',
                                        borderRadius: '18px 18px 18px 4px', border: '1px solid #f3f4f6'
                                    }}>
                                        <motion.div style={{ display: 'flex', gap: '4px' }}>
                                            {[0, 1, 2].map(i => (
                                                <motion.div key={i} style={{
                                                    width: 6, height: 6, borderRadius: '50%', background: '#ff4d88'
                                                }}
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                                            ))}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick replies */}
                        {messages.length <= 2 && (
                            <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {quickReplies.map((q, i) => (
                                    <motion.button key={i}
                                        onClick={() => sendMessage(q)}
                                        style={{
                                            padding: '5px 10px', borderRadius: '12px',
                                            background: '#fff0f5', border: '1px solid #ffb3cc',
                                            color: '#ff4d88', fontSize: '11px', fontWeight: 600,
                                            cursor: 'pointer', fontFamily: 'Poppins'
                                        }}
                                        whileHover={{ background: '#ffe0ec', scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}>
                                        {q}
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div style={{
                            padding: '12px 16px', borderTop: '1px solid #f3f4f6',
                            display: 'flex', gap: '8px', alignItems: 'center'
                        }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '10px 14px',
                                    border: '2px solid #ffe0ec', borderRadius: '14px',
                                    fontFamily: 'Poppins', fontSize: '13px', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#ff4d88'}
                                onBlur={e => e.target.style.borderColor = '#ffe0ec'}
                            />
                            <motion.button
                                onClick={() => sendMessage(input)}
                                disabled={loading || !input.trim()}
                                style={{
                                    width: 40, height: 40, borderRadius: '12px',
                                    background: input.trim() ? 'linear-gradient(135deg, #ff4d88, #e6005c)' : '#f3f4f6',
                                    border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', transition: 'all 0.2s'
                                }}
                                whileHover={input.trim() ? { scale: 1.1 } : {}}
                                whileTap={input.trim() ? { scale: 0.95 } : {}}>
                                🚀
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}