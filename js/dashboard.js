// Updated filter logic
document.querySelectorAll('.list-filter input, .list-filter select').forEach(input => {
    input.addEventListener('input', () => {
        const filters = {
            date: document.getElementById('filter-date').value,
            plate: document.getElementById('filter-plate').value.toLowerCase(),
        };

        document.querySelectorAll('tbody tr').forEach(row => {
            const [date, , , plate] = row.children;

            // Check if the row matches the date filter
            const rowDate = new Date(date.textContent);
            const filterDate = filters.date ? new Date(filters.date) : null;
            const matchesDate = !filterDate || rowDate >= filterDate;

            // Check if the row matches the plate filter
            const matchesPlate = !filters.plate || plate.textContent.toLowerCase().includes(filters.plate);

            // Show or hide the row based on the filters
            row.style.display = matchesDate && matchesPlate ? '' : 'none';
        });
    });
});
