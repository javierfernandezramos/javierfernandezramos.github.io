// src/pages/api/chat.js - API Route para proxies de Gemini seguros en Vercel
export const prerender = false;

export async function POST({ request }) {
    try {
        const apiKey = (import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
        
        if (!apiKey) {
            console.error("Falta la API Key de Gemini en el servidor.");
            return new Response(JSON.stringify({ 
                error: "La API Key de Gemini no está configurada en el servidor." 
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Obtener el cuerpo de la petición enviada por el chatbot
        const { contents, systemInstruction, generationConfig } = await request.json();

        // Llamar directamente a la API de Google Gemini en el backend seguro
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents,
                systemInstruction,
                generationConfig
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error devuelto por la API de Gemini:", errorText);
            return new Response(errorText, {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error en el endpoint del servidor /api/chat:", error);
        return new Response(JSON.stringify({ 
            error: "Error interno del servidor", 
            details: error.message 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
