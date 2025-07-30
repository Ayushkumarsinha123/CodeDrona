document.addEventListener("DOMContentLoaded", () => {
    const askButton = document.getElementById("ask-btn");
    const analyzeButton = document.getElementById("analyze-btn");
    const promptInput = document.getElementById("prompt");
    const responseBox = document.getElementById("response");
    
    // Ask button: custom prompt from user
    askButton.addEventListener("click", async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            responseBox.innerText = "🙏 Please ask your question.";
            return;
        }
        await sendToAI(prompt);
    });

    // Analyze button: extract problem from page and generate solution explanation
    analyzeButton.addEventListener("click", () => {
        responseBox.innerText = "🔍 Analyzing problem on page...";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "extractProblem" },
                async (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Runtime error:", chrome.runtime.lastError.message);
                        responseBox.innerText = "⚠️ Failed to connect to the page content.";
                        return;
                    }

                    const problemText = response?.text;
                    if (!problemText || problemText.includes("⚠️")) {
                        responseBox.innerText = problemText || "❌ Could not get problem text.";
                        return;
                    }

                    const prompt = `Explain how to solve this DSA problem step-by-step without giving the final code. Problem: ${problemText}`;
                    await sendToAI(prompt);
                }
            );
        });
    });

    /**
     * Sends a prompt to the Google Gemini API and displays the response.
     * @param {string} prompt The user's prompt to send to the AI.
     */
    async function sendToAI(prompt) {
        // --- ⚠️ IMPORTANT: Replace with your actual Google AI Studio API key ---
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

        responseBox.innerText = "🧘‍♂️ Consulting the Gemini scrolls...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "systemInstruction": {
                        "parts": {
                            "text": "You are a DSA mentor who guides students step-by-step."
                        }
                    },
                    "contents": [{
                        "role": "user",
                        "parts": {
                            "text": prompt
                        }
                    }]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error.message);
            }

            const data = await response.json();
            
            // Check for safety ratings or lack of response content
            if (!data.candidates || data.candidates.length === 0) {
                const blockReason = data.promptFeedback?.blockReason;
                responseBox.innerText = blockReason
                    ? `❌ Request blocked: ${blockReason}`
                    : "🧘‍♂️ Silence... try again later.";
                return;
            }

            const answer = data.candidates[0]?.content?.parts[0]?.text;
            responseBox.innerText = answer || "🧘‍♂️ Silence... try again later.";

        } catch (error) {
            console.error("Error fetching answer:", error);
            responseBox.innerText = `⚠️ An error occurred: ${error.message}`;
        }
    }
});