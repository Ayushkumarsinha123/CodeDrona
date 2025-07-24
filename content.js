chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractProblem") {
    let text = "";

    // Try LeetCode-style
    const leetDesc = document.querySelector(
      ".content__u3I1.question-content__JfgR"
    );
    if (leetDesc) {
      text = leetDesc.innerText.trim();
    }

    // Try GeeksforGeeks-style
    const gfgDesc = document.querySelector(".problem-statement");
    if (!text && gfgDesc) {
      text = gfgDesc.innerText.trim();
    }

    // Try Codeforces
    const cfDesc = document.querySelector(".problem-statement");
    if (!text && cfDesc) {
      text = cfDesc.innerText.trim();
    }

    // Try HackerRank
    const hrDesc = document.querySelector(".challenge_problem_statement");
    if (!text && hrDesc) {
      text = hrDesc.innerText.trim();
    }

    // Fallback: first big block of text
    if (!text) {
      const allParagraphs = document.querySelectorAll("p");
      text = Array.from(allParagraphs)
        .map((p) => p.innerText.trim())
        .filter((t) => t.length > 40)
        .join("\n\n")
        .slice(0, 1000); // Avoid too much text
    }

    if (!text) {
      sendResponse({
        text: "⚠️ Could not find the problem description element.",
      });
    } else {
      sendResponse({ text });
    }

    return true; // Keep the message channel open
  }
});
