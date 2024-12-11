// Simple filter logic
document.querySelectorAll('.list-filter input, .list-filter select').forEach(input => {
    input.addEventListener('input', () => {
        const filters = {
            date: document.getElementById('filter-date').value,
            plate: document.getElementById('filter-plate').value.toLowerCase(),
        };

        document.querySelectorAll('tbody tr').forEach(row => {
            const [date, , , plate] = row.children;
            const matchesDate = !filters.date || date.textContent === filters.date;
            const matchesPlate = !filters.plate || plate.textContent.toLowerCase().includes(filters.plate);

            row.style.display = matchesDate && matchesPlate ? '' : 'none';
        });
    });
});