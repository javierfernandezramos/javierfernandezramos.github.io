// ChatBot.ts - Asistente de IA para JaviPhoto usando Google Gemini (Cargado Dinámicamente)

// URL del endpoint de backend seguro en Vercel
const API_URL = "/api/chat";

// Instrucciones de sistema para moldear la personalidad de la IA
const systemInstruction = `Eres el asistente virtual de JaviPhoto (Javier Fernández Ramos), fotógrafo profesional en Valencia.
Tu objetivo es ayudar a los usuarios que visitan la web a informarse sobre los servicios de Javier y guiarles a la sección de contacto.
Responde de forma concisa, educada, cercana y profesional.

PERSONA Y REGLA DE PUNTO DE VISTA OBLIGATORIA (MUY IMPORTANTE):
- Debes hablar siempre en TERCERA PERSONA sobre Javier (Javi), refiriéndote a él como 'Javier' o 'Javi'.
- NUNCA hables en primera persona ('yo', 'mi', 'mis tarifas', 'nosotros', 'puedes escribirme'). Tú eres su asistente de IA, NO eres Javier.
- Ejemplo correcto: 'Las tarifas de Javi...', 'Javi ofrece...', 'puedes escribir a Javi a través de contacto...', 'Javier utiliza...'.
- Ejemplo incorrecto: 'Mis tarifas...', 'Ofrezco...', 'puedes escribirme...', 'utilizo...'.
- Las respuestas del chatbot deben reflejar esta tercera persona sobre Javier de forma constante en cada bocadillo.

Detalles de los servicios y precios de Javi:
1. Retratos:
   - Express: 90€-110€ (para una actualización rápida de perfil).
   - Pro Portfolio: 160€-190€ (el pack estrella de Javi, incluye cambio de ropa).
   - Editorial/Brand: desde 250€ (retratos sofisticados en estudio o exteriores).
2. Deportes:
   - Quick Action: desde 90€ (sesiones de acción cortas).
   - Full Performance: 160€-190€ (con fotos extra, ideal para atletas).
   - Cobertura de Evento o Clubes: desde 250€.
3. Fitness:
   - Glow Session: 90€-110€ (perfecto para redes sociales).
   - Athlete Portfolio: 160€-190€ (incluye un video Reel de regalo).
   - Gym Brand: desde 280€ (para entrenadores y gimnasios).
4. Eventos:
   - Essential Event: 100€-120€ (1 hora de cobertura).
   - Full Coverage: 180€-220€ (3 horas de cobertura y video de regalo).
   - Premium Event: desde 300€ (jornadas completas).
5. Marca Personal / Branding:
   - Quick Start: 90€-110€ (15 fotos de marca).
   - Brand Story: 200€-240€ (contenido para un mes de redes sociales).
   - Total Identity: desde 350€ (incluye un video de presentación de 30 segundos).

Ubicación de Javi: Basado en Valencia capital, con disponibilidad para desplazamientos en la provincia y Comunidad Valenciana.
Datos de contacto directos de Javi:
- Teléfono móvil y WhatsApp: +34 665 01 85 16 (o +34 665 018 516)
- Correo electrónico: javierfernandezramos9@gmail.com
- Entrega de material: Enlace a galería digital privada con fotos editadas en alta resolución. Javi entrega un avance en 48 horas tras la sesión y el pack completo en 7-10 días laborables. No se entregan fotos sin editar (RAW).

Enlaces exactos de la web (UTILIZA ESTAS RUTAS EN FORMATO MARKDOWN):
- Página principal / Inicio: [/](/)
- Página general de Servicios y precios: [servicios](/servicios)
- Fotografía de Retratos: [retratos profesionales](/servicios/retratos-profesionales-valencia)
- Fotógrafo Fitness: [fotógrafo fitness](/servicios/fotografo-fitness-valencia)
- Fotógrafo de Eventos: [fotógrafo de eventos](/servicios/fotografo-eventos-valencia)
- Fotografía de Marca Personal: [marca personal](/servicios/fotografia-marca-personal-valencia)
- Fotógrafo Deportivo: [fotógrafo deportivo](/servicios/fotografo-deportivo-valencia)
- Galería / Portfolio de trabajos: [galería](/galeria)
- Videos: [videos](/videos)
- Diseñar un pack personalizado: [personalizar pack](/personalizar-pack)
- Página de Contacto y reservas: [contacto](/contacto)

Reglas de comportamiento:
- Responde siempre en español.
- REGLA DE TEMÁTICA EXCLUSIVA (CRÍTICO): Si el usuario pregunta por cualquier tema que NO esté relacionado con Javier Fernández Ramos, sus servicios de fotografía, tarifas, galería, videos o contacto, debes indicarle amablemente que no puedes responder a esa pregunta porque tu función es únicamente ayudarle con consultas sobre los servicios fotográficos de Javi. Guíalo de vuelta a la temática de fotografía de Javi o redirígele a la página de [contacto](/contacto). No respondas preguntas de cultura general, idiomas, traducciones, programación u otros temas ajenos.
- Mantén las respuestas muy cortas (máximo 2 o 3 frases breves).
- Usa viñetas o listas cortas si listas precios para facilitar la lectura.
- REGLA DE ENLACES OBLIGATORIA: Siempre que hables de un servicio o página de la web, DEBES incluir obligatoriamente su enlace Markdown exacto. 
  Ejemplos:
  * Si te preguntan qué servicios ofrece Javi, menciona los 5 tipos y enlaza cada uno con su ruta exacta, además de enlazar a la página general de [servicios](/servicios).
  * Si preguntan por videos, guíales a la página de [videos](/videos).
  * Si preguntan cómo reservar o contactar con Javi, añade el enlace a la página de [contacto](/contacto).
- Si te preguntan algo de lo que no estás seguro (como disponibilidad de fechas), redirígelos amablemente a la sección de [contacto](/contacto) para hablar con Javier.`;

// Saneamiento profundo para asegurar que el historial sea alterno (user/model) y válido para Gemini
function sanitizeHistory(history: any[]) {
    if (!Array.isArray(history)) return [];
    const clean = [];
    let expectedRole = "user";
    for (let i = 0; i < history.length; i++) {
        const msg = history[i];
        const textContent = msg?.parts?.[0]?.text;
        if (msg && msg.role === expectedRole && textContent && textContent.trim()) {
            clean.push({
                role: msg.role,
                parts: [{ text: textContent }]
            });
            expectedRole = expectedRole === "user" ? "model" : "user";
        }
    }
    if (clean.length > 0 && clean[clean.length - 1].role === "user") {
        clean.pop();
    }
    return clean;
}

// Estado del historial de conversación
let conversationHistory: any[] = [];

// Intentar restaurar el historial de conversación desde sessionStorage
try {
    const storedHistory = sessionStorage.getItem("chatbot_history");
    if (storedHistory) {
        conversationHistory = sanitizeHistory(JSON.parse(storedHistory));
        sessionStorage.setItem("chatbot_history", JSON.stringify(conversationHistory));
    }
} catch (e) {
    console.error("Error al restaurar historial del chat:", e);
}

// Elementos DOM
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotWindow = document.getElementById("chatbot-window");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotMessages = document.getElementById("chatbot-messages");
const inputForm = document.getElementById("chatbot-input-form");
const inputField = document.getElementById("chatbot-input-field") as HTMLInputElement | null;
const typingIndicator = document.getElementById("chatbot-typing");

// Control de límites y anti-abuso
let lastMessageTime = 0;
let messageCount = parseInt(sessionStorage.getItem("chatbot_msg_count") || "0", 10);

function checkMessageLimit() {
    if (messageCount >= 10) {
        if (inputForm) {
            inputForm.innerHTML = `<p style="color: rgba(255,255,255,0.65); font-size: 0.82rem; margin: 0; padding: 0.2rem 0; text-align: center; width: 100%; font-family: 'Outfit', sans-serif;">Has alcanzado el límite de 10 mensajes. Puedes contactar con Javier a través de [contacto](/contacto).</p>`;
            inputForm.innerHTML = inputForm.innerHTML.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--color-gold); text-decoration:underline; font-weight:600;">$1</a>');
        }
        return true;
    }
    return false;
}

function appendWarningMessage(text: string) {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper system-wrapper";
    wrapper.style.alignSelf = "center";
    wrapper.style.margin = "8px 0";
    wrapper.style.maxWidth = "90%";
    
    const msgDiv = document.createElement("div");
    msgDiv.className = "message system-message";
    msgDiv.style.background = "rgba(197, 160, 89, 0.08)";
    msgDiv.style.border = "1px dashed rgba(197, 160, 89, 0.4)";
    msgDiv.style.color = "var(--color-gold)";
    msgDiv.style.fontSize = "0.78rem";
    msgDiv.style.padding = "0.45rem 0.9rem";
    msgDiv.style.borderRadius = "8px";
    msgDiv.style.textAlign = "center";
    msgDiv.textContent = text;
    
    wrapper.appendChild(msgDiv);
    chatbotMessages?.appendChild(wrapper);
}

// Restaurar los mensajes visuales del historial en el DOM al cargar
if (conversationHistory.length > 0) {
    const initialChips = chatbotMessages?.querySelector(".suggestion-chips-container");
    initialChips?.remove();

    conversationHistory.forEach(msg => {
        const isUser = msg.role === "user";
        const text = msg.parts?.[0]?.text || "";
        if (isUser) {
            appendMessage(text, "user-message");
        } else {
            appendFormattedBotMessage(text);
        }
    });
}

checkMessageLimit();

const chatbotWrapper = document.querySelector(".chatbot-wrapper");

function toggleScrollLock(isLocked: boolean) {
    if (isLocked) {
        document.documentElement.classList.add("chatbot-active-scroll-lock");
        document.body.classList.add("chatbot-active-scroll-lock");
    } else {
        document.documentElement.classList.remove("chatbot-active-scroll-lock");
        document.body.classList.remove("chatbot-active-scroll-lock");
    }
}

function toggleChatbot(isOpen: boolean) {
    if (isOpen) {
        chatbotWindow?.classList.add("active");
        chatbotWrapper?.classList.add("active-chat");
        sessionStorage.setItem("chatbot_active", "true");
        toggleScrollLock(true);
        
        setTimeout(() => {
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (window.innerWidth > 768 && !isTouchDevice) {
                inputField?.focus();
            }
            scrollToBottom();
        }, 100);
    } else {
        chatbotWindow?.classList.remove("active");
        chatbotWrapper?.classList.remove("active-chat");
        sessionStorage.setItem("chatbot_active", "false");
        toggleScrollLock(false);
        inputField?.blur();
    }
}

if (sessionStorage.getItem("chatbot_active") === "true") {
    toggleChatbot(true);
}

chatbotToggle?.addEventListener("click", () => {
    const isOpen = !chatbotWindow?.classList.contains("active");
    toggleChatbot(isOpen);
});

chatbotClose?.addEventListener("click", () => {
    toggleChatbot(false);
});

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
        if (chatbotWindow?.classList.contains("active") && window.innerWidth <= 600) {
            scrollToBottom();
        }
    });
}

document.addEventListener("click", (e) => {
    if (chatbotWindow?.classList.contains("active")) {
        const target = e.target;
        if (target instanceof Node && chatbotWindow && chatbotToggle) {
            if (!chatbotWindow.contains(target) && !chatbotToggle.contains(target)) {
                toggleChatbot(false);
            }
        }
    }
});

chatbotMessages?.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof Element) {
        const link = target.closest("a");
        if (link) {
            toggleChatbot(false);
        }
    }
});

document.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof Element && target.classList.contains("suggestion-chip")) {
        const question = target.getAttribute("data-question");
        if (question) {
            if (messageCount >= 10) {
                checkMessageLimit();
                return;
            }
            const now = Date.now();
            if (now - lastMessageTime < 5000) {
                appendWarningMessage("Estás enviando mensajes demasiado rápido. Por favor, espera unos segundos.");
                scrollToBottom();
                return;
            }
            target.parentElement?.remove();
            lastMessageTime = now;
            handleUserMessage(question);
        }
    }
});

inputForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField) return;

    if (messageCount >= 10) {
        checkMessageLimit();
        return;
    }

    const now = Date.now();
    if (now - lastMessageTime < 5000) {
        appendWarningMessage("Estás enviando mensajes demasiado rápido. Por favor, espera unos segundos.");
        scrollToBottom();
        return;
    }

    const text = inputField.value.trim();
    if (!text) return;
    
    if (text.length > 200) {
        appendWarningMessage("El mensaje es demasiado largo (máximo 200 caracteres).");
        scrollToBottom();
        return;
    }

    lastMessageTime = now;
    inputField.value = "";
    handleUserMessage(text);
});

async function handleUserMessage(text: string) {
    messageCount++;
    sessionStorage.setItem("chatbot_msg_count", messageCount.toString());

    appendMessage(text, "user-message");
    scrollToBottom();

    typingIndicator?.classList.remove("hidden");
    scrollToBottom();

    conversationHistory = sanitizeHistory(conversationHistory);
    conversationHistory.push({
        role: "user",
        parts: [{ text: text }]
    });
    sessionStorage.setItem("chatbot_history", JSON.stringify(conversationHistory));

    try {
        let apiHistory = conversationHistory.slice(-5);
        if (apiHistory.length > 0 && apiHistory[0].role === "model") {
            apiHistory = apiHistory.slice(1);
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: apiHistory,
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Gemini API Error Detail:", errorData);
            if (response.status === 429) {
                throw new Error("RATE_LIMIT_ERROR");
            }
            throw new Error("API_ERROR");
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no he podido procesar tu solicitud. Por favor, contacta con Javier directamente desde [contacto](/contacto).";

        typingIndicator?.classList.add("hidden");
        appendFormattedBotMessage(replyText);
        scrollToBottom();

        conversationHistory.push({
            role: "model",
            parts: [{ text: replyText }]
        });
        sessionStorage.setItem("chatbot_history", JSON.stringify(conversationHistory));

        checkMessageLimit();

    } catch (error: any) {
        console.error("Chatbot Error:", error);
        typingIndicator?.classList.add("hidden");
        
        if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === "user") {
            conversationHistory.pop();
            sessionStorage.setItem("chatbot_history", JSON.stringify(conversationHistory));
        }

        if (messageCount > 0) {
            messageCount--;
            sessionStorage.setItem("chatbot_msg_count", messageCount.toString());
        }

        if (error.message === "RATE_LIMIT_ERROR") {
            appendFormattedBotMessage("He recibido demasiadas preguntas en poco tiempo. Por favor, espera un minuto antes de volver a intentarlo, o escribe a Javier directamente desde [contacto](/contacto).");
        } else {
            appendFormattedBotMessage("Vaya, parece que tengo un problema de conexión temporal. Puedes contactar directamente con Javier desde [contacto](/contacto).");
        }
        scrollToBottom();
    }
}

function appendMessage(text: string, className: string) {
    const wrapper = document.createElement("div");
    const isUser = className.includes("user-message");
    wrapper.className = `message-wrapper ${isUser ? 'user-wrapper' : 'bot-wrapper'}`;
    
    const sender = document.createElement("span");
    sender.className = "message-sender";
    sender.textContent = isUser ? "Tú" : "Asistente";
    
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${className}`;
    msgDiv.textContent = text;
    
    wrapper.appendChild(sender);
    wrapper.appendChild(msgDiv);
    chatbotMessages?.appendChild(wrapper);
}

function appendFormattedBotMessage(rawText: string) {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper bot-wrapper";
    
    const sender = document.createElement("span");
    sender.className = "message-sender";
    sender.textContent = "Asistente";
    
    const msgDiv = document.createElement("div");
    msgDiv.className = "message bot-message";

    let htmlContent = rawText
        .replace(/\n/g, "<br>")
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|<br>)\s*[-*]\s+/g, '$1• ')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--color-gold); text-decoration:underline; font-weight:600;">$1</a>');

    msgDiv.innerHTML = htmlContent;
    
    wrapper.appendChild(sender);
    wrapper.appendChild(msgDiv);
    chatbotMessages?.appendChild(wrapper);
}

function scrollToBottom() {
    if (chatbotMessages) {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

export {};

