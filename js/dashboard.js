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
    // Calendar
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

                    // Debugging: log the response to check drive_start and drive_end
                    //console.log('Fetched Data:', data);

                    let events = data.map(drive => ({
                        id: drive.id,  // Include the drive ID to reference later
                        title: drive.license_plate,
                        start: drive.drive_date, // Assuming drive_date is in a valid format (YYYY-MM-DD or similar)
                        end: drive.drive_date,   // Same as start for a one-day event
                        color: '#f45b69',
                        textColor: 'white',
                        description: `${drive.drive_start} nach ${drive.drive_end}`, // Ensure these fields are correct
                        kmDriven: drive.km_driven,
                        kmStart: drive.km_start,
                        kmEnd: drive.km_end,
                        driveDate: drive.drive_date, // Date of the drive
                    }));

                    successCallback(events);
                } catch (error) {
                    console.error('Error fetching events:', error);
                    failureCallback(error);
                }
            },
            eventClick: function (info) {
                const event = info.event;

                // Create a message to display event details in the modal
                const eventDetails = `
                <p><strong>Kennzeichen:</strong> ${event.title}</p>
                <p><strong>Datum:</strong> ${event.extendedProps.driveDate}</p>
                <p><strong>Route:</strong> ${event.extendedProps.description}</p>
                <p><strong>Kilometer Anfahrt:</strong> ${event.extendedProps.kmStart}</p>
                <p><strong>Kilometer Ankunft:</strong> ${event.extendedProps.kmEnd}</p>
                <p><strong>Kilometer Gefahren:</strong> ${event.extendedProps.kmDriven}</p>
            `;

                // Show details in the modal
                document.getElementById('eventDetails').innerHTML = eventDetails;
                document.getElementById('eventModal').style.display = "block";

                // Close the modal when the user clicks the close button
                document.querySelector('.close').onclick = function () {
                    document.getElementById('eventModal').style.display = "none";
                }

                // Close the modal if the user clicks anywhere outside of the modal
                window.onclick = function (event) {
                    if (event.target == document.getElementById('eventModal')) {
                        document.getElementById('eventModal').style.display = "none";
                    }
                }
            }
        });

        calendar.render();
    }
    fetchAndRenderCalendar();

    function fetchCarKilometers() {
        const selectedCarId = document.getElementById('car_plate').value;

        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // Configure it: GET-request for the URL with the car_id as a query parameter
        xhr.open('GET', `php/get_car_kilometers.php?car_id=${selectedCarId}`, true);

        // Set up what happens when the request is successfully completed
        xhr.onload = function () {
            if (xhr.status === 200) {
                // Parse the response JSON
                const data = JSON.parse(xhr.responseText);
                const kmBeforeElement = document.getElementById('km_before'); // The input element to fill

                // Fill the km_before input field with the kilometers value
                if (data.kilometers !== 'No kilometers found.' && data.kilometers !== 'Invalid car ID.') {
                    kmBeforeElement.value = data.kilometers; // Set the value of the input field
                } else {
                    kmBeforeElement.value = ''; // Clear the input field if no kilometers found or invalid car ID
                }
            } else {
                // If something went wrong with the request
                console.error('Error fetching car kilometers:', xhr.statusText);
            }
        };

        // Set up what happens in case of an error
        xhr.onerror = function () {
            console.error('Request failed');
        };

        // Send the request
        xhr.send();
    }

    // Call the function when the page loads (or when a change happens)
    fetchCarKilometers();

    document.getElementById('car_plate').addEventListener('change', function () {
        const car_plate = this.value;

        if (car_plate) {
            // Fetch drives data for the selected employee via AJAX
            fetchDrivesData(car_plate);
        }
    });

    document.querySelectorAll('.list-filter input, .list-filter select').forEach(input => {
        input.addEventListener('input', () => {
            filterDrivesTable();
        });
    });
    function fetchDrivesData(car_plate) {
        // Make the AJAX call to the server (adjust URL accordingly)
        const url = `php/get_drives.php?employee_id=${car_plate}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                populateDrivesTable(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function populateDrivesTable(data) {
        const tbody = document.getElementById('drives-tbody');
        tbody.innerHTML = ''; // Clear any existing rows

        data.forEach(drive => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${drive.drive_date}</td>
            <td>${drive.km_start}</td>
            <td>${drive.km_end}</td>
            <td>${drive.plate}</td>
        `;
            tbody.appendChild(row);
        });
    }

    function filterDrivesTable() {
        const filters = {
            date: document.getElementById('filter-date').value,
            plate: document.getElementById('filter-plate').value.toLowerCase(),
        };

        const rows = document.querySelectorAll('#drives-tbody tr');
        rows.forEach(row => {
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
    }

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
