document.addEventListener("DOMContentLoaded", function() {
    const sunContainer = document.querySelector(".sun-container");

    // Function to restart animation
    const restartAnimation = () => {
        sunContainer.classList.remove("sun-animation");
        void sunContainer.offsetWidth; // Trigger reflow
        sunContainer.classList.add("sun-animation");
        console.log("Animation restarted.");
    };

    // Start animation initially
    sunContainer.classList.remove("sun-animation");

    // Delayed restart animation on page load
    setTimeout(() => {
        sunContainer.classList.add("sun-animation");
    }, 100); // Adjust delay timing as needed

    // Wait for the sun animation to finish
    sunContainer.addEventListener("animationend", function() {
        console.log("Animation ended. Redirecting to homePage.html...");
        window.location.href = "../homePage/homePage.html";
    });

    // Restart animation when page is about to reload
    window.addEventListener("beforeunload", function() {
        restartAnimation();
    });
});
