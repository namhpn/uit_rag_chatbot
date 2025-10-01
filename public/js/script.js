const button = document.querySelector(".sendBtn")
const chatContent = document.querySelector(".chat-input")
const chatBox = document.querySelector(".conversation")

button.addEventListener('click',request)
chatContent.addEventListener("keypress", (e) => {
    if (e.key === "Enter"){
        request()
    }
})

function request() {
    const chatText = chatContent.value
    if (!chatText) return

    chatContent.disabled = true
    button.disabled = true

    appendConversation({
        role: 'User',
        text: chatText
    })
    console.log(chatText)
    fetch('/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: chatText})
      })
        .then(response => response.json())
        .then(data => {
            appendConversation({
                role: 'AI',
                text: data.answer,
                humanText: chatText
            });
        })
        .catch(error => {
          console.error('Error:', error.error);
          appendConversation({
            role: 'ERROR',
            text: error.error
          })
        })
        .finally(() => {
          chatContent.value = '';
          chatContent.disabled = false;
          button.disabled = false;
        });
}

function appendConversation(details) {
    const container = document.createElement('div');
    const context = document.createElement('p');

    if (details.role !== "ERROR")
        context.innerHTML = marked.parse(details.text);
    else 
        context.textContent = (details.text === undefined ? "An unexpected error occurred. Please try again later." : details.text);

    if(details.role === "User")
        container.classList.add("user-chat");

    container.appendChild(context);
    chatBox.appendChild(container);
    requestAnimationFrame(() => {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    });
}