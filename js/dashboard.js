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
    // Get today's date
    const today = new Date();
    // Format the date in ISO format (YYYY-MM-DD)
    const isoDate = today.toISOString().split('T')[0];
    // Get the input field
    const dateInput = document.getElementById('date_drive');
    // Set the value of the input field to today's date
    dateInput.value = isoDate;
    
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

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    // Merge and pass the events to FullCalendar
                    successCallback(data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                    failureCallback(error);
                }
            },
            eventClick: function (info) {
                const event = info.event;

                const eventDetails = `
                <p><strong>Title:</strong> ${event.title}</p>
                <p><strong>Start:</strong> ${event.start}</p>
                <p><strong>End:</strong> ${event.end}</p>
                <p><strong>Description:</strong> ${event.extendedProps.description || 'N/A'}</p>
                ${event.extendedProps.kmDriven ? `
                    <p><strong>Kilometers Driven:</strong> ${event.extendedProps.kmDriven}</p>
                    <p><strong>Kilometer Start:</strong> ${event.extendedProps.kmStart}</p>
                    <p><strong>Kilometer End:</strong> ${event.extendedProps.kmEnd}</p>
                ` : ''}
                ${event.extendedProps.location ? `<p><strong>Location:</strong> ${event.extendedProps.location}</p>` : ''}
            `;

                document.getElementById('eventDetails').innerHTML = eventDetails;
                document.getElementById('eventModal').style.display = "block";

                document.querySelector('.close').onclick = function () {
                    document.getElementById('eventModal').style.display = "none";
                };

                window.onclick = function (event) {
                    if (event.target == document.getElementById('eventModal')) {
                        document.getElementById('eventModal').style.display = "none";
                    }
                };
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

    // Add event listeners to filter inputs
    document.querySelectorAll('.list-filter input, .list-filter select').forEach(input => {
        input.addEventListener('input', () => {
            filterDrivesTable();
        });
    });

    // Function to fetch drives data via AJAX
    function fetchDrivesData() {
        const carId = document.getElementById('car_plate').value;
        // Make the AJAX call to the server (adjust URL accordingly)
        const url = `php/get_drives.php?car_id=${carId}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                populateDrivesTable(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    fetchDrivesData();

    // Function to populate drives table
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

    // Function to filter drives table
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
