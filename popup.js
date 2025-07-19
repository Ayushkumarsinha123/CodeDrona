document.addEventListener("DOMContentLoaded", () => {
  const askButton = document.getElementById("ask-btn");
  const analyzeButton = document.getElementById("analyze-btn");
  const promptInput = document.getElementById("prompt");
  const responseBox = document.getElementById("response");

  askButton.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      responseBox.innerText = "🙏 Please ask your question, my child.";
      return;
    }

    await sendToAI(prompt);
  });

  analyzeButton.addEventListener("click", async () => {
    responseBox.innerText = "🔍 Analyzing problem on page...";

   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: "extractProblem" },
    async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
        responseBox.innerText = "⚠️ Failed to connect to content script.";
        return;
      }

      const text = response?.text || response?.result;
      if (!text) {
        responseBox.innerText = "⚠️ No description found.";
        return;
      }

      await sendToAI(`Explain this DSA problem: ${text}`);
    }
  );
});

  });

  async function sendToAI(prompt) {
    responseBox.innerText = "🧘‍♂️ Consulting the ancient scrolls...";

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer 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",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant who explains DSA concepts clearly and concisely for beginners.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const answer =
        data.choices?.[0]?.message?.content || "🧘‍♂️ Silence... try again later.";
      responseBox.innerText = answer;
    } catch (error) {
      console.error("Error fetching answer:", error);
      responseBox.innerText = "⚠️ An error occurred while invoking CodeDrona.";
    }
  }
});
