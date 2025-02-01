document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let query = document.getElementById("searchInput").value.trim();
    if (query) {
        console.log("Search for:", query);
        // Placeholder for search handling logic
        alert("Search feature coming soon!");
    }
});
