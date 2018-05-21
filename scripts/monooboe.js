let port = chrome.runtime.connect();

console.log("script running");

let anchor = document.getElementById("page_container");

let container = document.createElement("div");
container.className = "mono-oboe"; // Just so it's clear when looking at the DOM
container.innerHTML = "Hello World!";

anchor.prepend(container);