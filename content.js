function extractQuestionText() {
  let description = "";

  if (window.location.hostname.includes("leetcode.com")) {
    const el = document.querySelector(".content__u3I1.question-content__JfgR");
    if (el) description = el.innerText;
  } else if (window.location.hostname.includes("geeksforgeeks.org")) {
    const el = document.querySelector(".entry-content");
    if (el) description = el.innerText;
  } else if (window.location.hostname.includes("hackerrank.com")) {
    const el = document.querySelector(".problem-statement");
    if (el) description = el.innerText;
  }

  return description.trim();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractProblem") {
    const text = extractQuestionText();
    if (text) {
      sendResponse({ text });
    } else {
      sendResponse({ text: "⚠️ Could not extract question from the page." });
    }
  }
});
