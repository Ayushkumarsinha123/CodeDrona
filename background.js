// background.js

// Fired when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("CodeDrona extension installed — your AI Guru is ready!");
});

// Listener to handle messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background.js:", request);

  if (request.type === "ask_ai") {
    // Placeholder for OpenRouter API call
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "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",  // Replace this
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // or another available model
        messages: [
          { role: "system", content: "You are CodeDrona, a wise Indian guru who teaches DSA with hints and guidance." },
          { role: "user", content: request.question }
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        const reply = data.choices?.[0]?.message?.content || "Sorry, I could not generate a reply.";
        sendResponse({ reply });
      })
      .catch(err => {
        console.error("OpenRouter API error:", err);
        sendResponse({ reply: "There was an error connecting to AI." });
      });

    return true; // keeps the message channel open for async `sendResponse`
  }
});
