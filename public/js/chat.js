// Select conversation
function selectConversation(element) {
    document.querySelectorAll('.conversation').forEach(conv => {
        conv.classList.remove('active');
    });
    element.classList.add('active');
}

// Send message (placeholder)
document.querySelector('.message-input button:last-child')?.addEventListener('click', () => {
    const input = document.querySelector('.message-input input');
    if (input.value.trim()) {
        console.log('Message sent:', input.value);
        input.value = '';
    }
});

console.log('Chat system initialized');
