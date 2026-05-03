const GROQ_API_KEY = CONFIG.GROQ_API_KEY; // Paste your key here

async function generatePlay() {
    const defense = document.getElementById('defense').value;
    const weather = document.getElementById('weather').value;
    const output = document.getElementById('play-display');

    output.innerHTML = "Coaching staff is thinking...";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are an elite Ultimate Frisbee coach for the UGA Chillydawgs. Provide a tactical play in plain text. Focus on handler resets and specific cuts."
                    },
                    {
                        role: "user",
                        content: `Generate a play against a ${defense} defense in ${weather} conditions.`
                    }
                ]
            })
        });

        const data = await response.json();
        output.innerHTML = `<h3>Generated Play:</h3><p>${data.choices[0].message.content}</p>`;
    } catch (error) {
        output.innerHTML = "Error connecting to the coaching cloud.";
        console.error(error);
    }
}