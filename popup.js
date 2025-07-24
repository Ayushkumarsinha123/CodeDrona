document.addEventListener("DOMContentLoaded", () => {
  const askButton = document.getElementById("ask-btn");
  const analyzeButton = document.getElementById("analyze-btn");
  const promptInput = document.getElementById("prompt");
  const responseBox = document.getElementById("response");

  // Ask button: custom prompt from user
  askButton.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      responseBox.innerText = "🙏 Please ask your question, my child.";
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
            responseBox.innerText = "⚠️ Failed to connect to content script.";
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

  // Function to call AI API and show response
  async function sendToAI(prompt) {
    responseBox.innerText = "🧘‍♂️ Consulting the ancient scrolls...";

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content: "You are a DSA mentor who guides students step-by-step.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;

      responseBox.innerText = answer || "🧘‍♂️ Silence... try again later.";
    } catch (error) {
      console.error("Error fetching answer:", error);
      responseBox.innerText = "⚠️ An error occurred while invoking CodeDrona.";
    }
  }
});
