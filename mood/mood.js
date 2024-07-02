// mood.js

// Function to set the selected mood
function setMood(mood) {
    document.getElementById('selectedMood').innerText = mood;
}

// Event listeners for each mood button
document.querySelectorAll('.moodButton').forEach(button => {
    button.addEventListener('click', () => {
        const mood = button.getAttribute('data-mood');
        setMood(mood);
    });
});
