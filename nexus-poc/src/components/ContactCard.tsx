import React, { useState } from 'react';

const ContactCard: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const contactData = {
        name: "Antonio Gutiérrez",
        role: "GTM Intelligence Architect",
        linkedIn: "https://www.linkedin.com/in/antoniogtzj/",
        email: "ventas.ejecutivob2b@gmail.com",
        phone: "+52 998 119 1903"
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            fontFamily: 'sans-serif'
        }}>
            {isOpen ? (
                <div style={{
                    background: 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 127, 0.3)',
                    borderRadius: '16px',
                    padding: '24px',
                    width: '280px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    color: '#fff',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <button 
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: '#00ff7f',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >×</button>
                    
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00ff7f, #00bfff)',
                            margin: '0 auto 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}>AG</div>
                        <h4 style={{ margin: '0', fontSize: '18px' }}>{contactData.name}</h4>
                        <p style={{ margin: '4px 0', opacity: 0.7, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{contactData.role}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <a href={contactData.linkedIn} target="_blank" rel="noreferrer" style={linkStyle}>
                            <span>🔗</span> LinkedIn Profile
                        </a>
                        <a href={`mailto:${contactData.email}`} style={linkStyle}>
                            <span>📧</span> {contactData.email}
                        </a>
                        <div style={linkStyle}>
                            <span>📱</span> {contactData.phone}
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #00ff7f, #00bfff)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0, 255, 127, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    👤
                </button>
            )}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    transition: 'background 0.2s'
};

export default ContactCard;
