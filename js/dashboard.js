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
$('#employee_name').change(function () {
    var userId = $(this).val(); // Get the selected user's ID

    // If a valid user is selected (ID is not empty)
    if (userId) {
        $.ajax({
            url: 'php/get_primary_car.php', // The PHP script that returns the primary car for the user
            type: 'GET',
            data: { user_id: userId }, // Send the user ID to the server
            success: function (response) {
                // Assuming response is the primary car ID
                var primaryCarId = response;

                // Set the car plate dropdown value to the primary car ID
                $('#car_plate').val(primaryCarId);
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    //Calender
    async function fetchAndRenderCalendar() {
        const selectedEmployeeId = document.getElementById('employee_name').value;

        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay'
            },
            events: async function (fetchInfo, successCallback, failureCallback) {
                try {
                    let response = await fetch(`php/get_drives_calendar.php?user_id=${selectedEmployeeId}`);
                    let data = await response.json();

                    let events = data.map(vacation => ({
                        title: drive.license_plate,
                        start: drive.drive_date,
                        end: drive.drive_date,
                        color: '#f45b69',
                        textColor: 'white',
                    }));

                    successCallback(events);
                } catch (error) {
                    console.error('Error fetching events:', error);
                    failureCallback(error);
                }
            }
        });
        calendar.render();
    }
    fetchAndRenderCalendar();
    // When the form is submitted
    $('#add_drive').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Collect the form data
        var userId = $('#employee_name').val();
        var carId = $('#car_plate').val();
        var dateDrive = $('#date_drive').val();
        var addrStart = $('#addr_start').val();
        var addrEnd = $('#addr_end').val();
        var kmBefore = $('#km_before').val();
        var kmNow = $('#km_now').val();

        // Calculate km_driven
        var kmDriven = kmNow - kmBefore;

        // Send the data to the server via AJAX
        $.ajax({
            url: 'php/add_drive.php', // PHP script to handle insertion
            type: 'POST',
            data: {
                user_id: userId,
                car_id: carId,
                km_start: kmBefore,
                km_end: kmNow,
                km_driven: kmDriven,
                drive_start: addrStart,
                drive_end: addrEnd,
                drive_date: dateDrive
            },
            success: function (response) {
                alert(response); // Show success message
                $('#add_drive')[0].reset(); // Reset the form
            },
            error: function () {
                alert('Error while adding the drive');
            }
        });
    });
});