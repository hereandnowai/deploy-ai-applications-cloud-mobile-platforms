document.addEventListener('DOMContentLoaded', async () => {
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

    // Program Switching Logic
    let programsData = [];
    let agendaData = [];

    async function fetchData() {
        try {
            const [agendaRes, programsRes] = await Promise.all([
                fetch('assets/data/agenda.json'),
                fetch('assets/data/programs.json')
            ]);
            agendaData = await agendaRes.json();
            programsData = (await programsRes.json()).programs;
            
            renderAgenda();
            
            // Check for URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const programId = urlParams.get('program') || 'vistas';
            renderProgram(programId);
        } catch (error) {
            console.error('Error fetching program data:', error);
        }
    }

    function renderAgenda() {
        const agendaBody = document.getElementById('agenda-body');
        if (!agendaBody) return;

        agendaBody.innerHTML = agendaData.map(item => `
            <tr>
                <td>${item.n}</td>
                <td>${item.client}</td>
                <td>${item.program}</td>
                <td>${item.start}</td>
                <td>${item.end}</td>
                <td>${item.timings}</td>
                <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
                <td><button onclick="switchProgram('${item.id}')" class="btn-view">View Syllabus</button></td>
            </tr>
        `).join('');
    }

    window.switchProgram = (id) => {
        // Update URL without reloading
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?program=' + id;
        window.history.pushState({ path: newUrl }, '', newUrl);
        renderProgram(id);
        
        // Scroll to syllabus
        const syllabusSection = document.getElementById('syllabus');
        if (syllabusSection) {
            window.scrollTo({
                top: syllabusSection.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    };

    function renderProgram(id) {
        const program = programsData.find(p => p.id === id) || programsData.find(p => p.id === 'vistas');
        if (!program) return;

        // Update Hero
        document.getElementById('hero-title').textContent = program.title;
        document.getElementById('hero-client').textContent = `Prepared for: ${program.client}`;

        // Update About Info
        document.getElementById('program-info-content').innerHTML = `<p>${program.about}</p>`;

        // Update Syllabus
        document.getElementById('syllabus-title').textContent = `${program.schedule.length}-Day Training Schedule`;
        document.getElementById('syllabus-meta').textContent = `Time: ${program.time} (Daily)`;
        
        const syllabusBody = document.getElementById('syllabus-body');
        syllabusBody.innerHTML = program.schedule.map(day => `
            <tr>
                <td>${day.day}</td>
                <td><strong>${day.topic}</strong></td>
                <td>${day.description}</td>
            </tr>
        `).join('');

        // Update Outcomes
        const outcomesList = document.getElementById('outcomes-list');
        outcomesList.innerHTML = program.outcomes.map(outcome => `<li>${outcome}</li>`).join('');
        
        // Update Download Link (if we had specific PDFs, otherwise keep default or hide)
        const prospectusLink = document.querySelector('.highlight-card a');
        if (prospectusLink) {
            // Mapping for specific PDFs if available, else fallback
            const pdfMap = {
                'vistas': 'assets/pdfs/program-syllabus-vistas.pdf',
                // We'll need to generate these or use placeholders
            };
            prospectusLink.setAttribute('href', pdfMap[id] || 'assets/pdfs/program-syllabus-vistas.pdf');
        }
    }

    fetchData();

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
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    
                    // Keep the last partial line in the buffer
                    buffer = lines.pop();
                    
                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) continue;
                        
                        if (trimmedLine.startsWith('data: ')) {
                            try {
                                const jsonStr = trimmedLine.substring(6);
                                const data = JSON.parse(jsonStr);
                                if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                                    const part = data.candidates[0].content.parts[0].text;
                                    fullText += part;
                                    botMsgDiv.textContent = fullText;
                                    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                                }
                            } catch (e) {
                                console.error('Error parsing SSE chunk:', e, trimmedLine);
                            }
                        }
                    }
                }
                
                // Process any remaining text in the buffer after the stream ends
                if (buffer.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(buffer.substring(6));
                        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                            fullText += data.candidates[0].content.parts[0].text;
                            botMsgDiv.textContent = fullText;
                        }
                    } catch (e) {}
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
