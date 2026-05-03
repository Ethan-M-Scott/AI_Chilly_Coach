/**
 * CHILLY-COACH AI: Logic Engine
 * Uses Gemini 3.1 Flash-Lite 
 */

async function generatePlay() {
    const situation = document.getElementById('situation').value;
    const output = document.getElementById('play-display');

    if (!situation.trim()) {
        output.innerHTML = "<p style='color: #ba0c2f;'>The coach needs a situation to call a play.</p>";
        return;
    }

    output.innerHTML = "<div class='play-box'>Analyzing the force and stall count...</div>";

    // Defining the "Rules of the Game" for the AI
    const systemInstruction = `You are the Tactical Head Coach of the UGA Chillydawgs.
    RULES FOR THE PLAYBOOK:
    1. STATIONARY THROWER: The person with the disc MUST be stationary. They pivot, but their feet do not move from the spot.
    2. CUTTERS: Only players WITHOUT the disc may run or cut.
    3. FORCE: Always account for the direction of the defensive force (Home, Away, Backhand, Forehand).
    4. TERMS: Use high-level terms (Huck, Dump-Swing, Break-side, Poach, Stack).
    
    FORMATTING:
    - Start with ## TACTICAL PLAY: [Name]
    - Bold headers for **THE SETUP** and **THE MOTION**.
    - Use bullet points for player roles.`;

    try {
        // Updated to the May 2026 stable Gemini 3.1 endpoint
        const api_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

        const response = await fetch(api_url, {
            method: "POST", // Method must be POST for Gemini to read the body
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemInstruction}\n\nSituation: ${situation}` }]
                }],
                // Lowering temperature to 0.1 ensures logic-first, non-creative results
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.8,
                    maxOutputTokens: 1000
                },
                // Sports strategy can trigger safety blocks; these settings prevent a "Blocked" response
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // Error handling for empty or blocked responses
        if (data.error) {
            throw new Error(data.error.message);
        }

        if (!data.candidates || data.candidates.length === 0 || data.candidates[0].finishReason === "SAFETY") {
            output.innerHTML = "<div class='play-box'>The play was flagged by the safety filter. Try avoiding aggressive terms like 'kill' or 'attack'.</div>";
            return;
        }

        const rawContent = data.candidates[0].content.parts[0].text;

        // Clean up the output formatting for the UI
        const formattedContent = rawContent
            .replace(/^## (.*$)/gim, '<h2>$1</h2>') // Convert ## to H2
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert ** to bold
            .replace(/\n/g, '<br>'); // Convert newlines to HTML breaks

        output.innerHTML = `<div class="play-box">${formattedContent}</div>`;

    } catch (error) {
        output.innerHTML = `<div class='play-box'>Technical Error: ${error.message}. <br><br><strong>Check:</strong> Is your API key correct in config.js? Are you using Live Server?</div>`;
        console.error("Coach Debug Error:", error);
    }
}