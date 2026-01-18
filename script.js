document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Intersection Observer for fade-in effect
    const fadeElements = document.querySelectorAll('.section');
    
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
    });

    // Apply animation logic (simulation of entry)
    setTimeout(() => {
        fadeElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);

    // Chatbot functionality
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const micBtn = document.getElementById('mic-btn');

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            micBtn.classList.add('listening');
            chatbotInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatbotInput.value = transcript;
        };

        recognition.onend = () => {
            micBtn.classList.remove('listening');
            chatbotInput.placeholder = "Type your message...";
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            micBtn.classList.remove('listening');
        };
    } else if (micBtn) {
        micBtn.style.display = 'none'; // Hide if not supported
    }

    const MODEL_NAME = "gemma-3-27b-it"; // Using the instruct version for chat support

    const SYSTEM_PROMPT = `
        You are Caramel, an AI assistant for HERE AND NOW AI.
        Your purpose is to answer questions ONLY about:
        1. The 10-day training program "Deployment of AI Applications for Cloud and Mobile Platforms" for Vels Institute of Science, Technology & Advanced Studies (VISTAS).
        2. HERE AND NOW AI organization, its mission ("AI is Good"), and contact details.
        
        Program Highlights:
        - Dates: Feb 2 to Feb 13, 2026.
        - Time: 9:30 AM to 12:30 PM.
        - Topics: Cloud deployment, Containers/Docker, DevOps, AI APIs, Mobile Architecture, Cost/Performance, Edge AI, Capstone Projects.
        
        Organization Details:
        - Website: hereandnowai.com
        - Email: info@hereandnowai.com
        - Phone: +91 996 296 1000
        - Social: LinkedIn, Instagram, GitHub, X, YouTube.

        If a user asks about anything else, politely decline and steer them back to these topics.
        Keep responses concise, helpful, and professional.
    `;

    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('active');
        });
    }

    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.remove('active');
        });
    }

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    if (chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userText = chatbotInput.value.trim();
            if (!userText) return;

            addMessage(userText, 'user');
            chatbotInput.value = '';

            // Typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('message', 'bot');
            typingDiv.id = 'typing-indicator';
            typingDiv.textContent = '...';
            chatbotMessages.appendChild(typingDiv);

            try {
                let response;
                const isLocalFile = window.location.protocol === 'file:';
                
                if (isLocalFile) {
                    const LOCAL_KEY = "REDACTED";
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:streamGenerateContent?alt=sse&key=${LOCAL_KEY}`;
                    
                    response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + userText }]
                            }]
                        })
                    });
                } else {
                    response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: userText,
                            systemPrompt: SYSTEM_PROMPT,
                            model: MODEL_NAME,
                            stream: true
                        })
                    });
                }

                // Remove typing indicator before starting stream
                const indicator = document.getElementById('typing-indicator');
                if (indicator) indicator.remove();

                const botMsgDiv = document.createElement('div');
                botMsgDiv.classList.add('message', 'bot');
                chatbotMessages.appendChild(botMsgDiv);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.candidates && data.candidates[0].content.parts[0].text) {
                                    const part = data.candidates[0].content.parts[0].text;
                                    fullText += part;
                                    botMsgDiv.textContent = fullText;
                                    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                                }
                            } catch (e) {
                                // Ignore parse errors for partial chunks
                            }
                        }
                    }
                }
            } catch (error) {
                const indicator = document.getElementById('typing-indicator');
                if (indicator) indicator.remove();
                
                addMessage("If not workiing, please contact +91-996-296-1000 or info@hereandnowai.com", 'bot');
                console.error('Chat error:', error);
            }
        });
    }
});
