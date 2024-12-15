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


    document.getElementById('date_drive').addEventListener('change', setAutomaticLocation);

    async function setAutomaticLocation() {
        const dateDrive = document.getElementById('date_drive').value;
        // Validate the input date
        if (!dateDrive) {
            console.error('Date drive is empty.');
            return;
        }
        try {
            // 1. Get user's location
            const userLocation = await getUserLocation();
            if (!userLocation) {
                console.warn('Unable to retrieve user location. Using default coordinates.');
                setDefaultAddresses(0, 0); // Default to (0, 0) if location is unavailable
                return;
            }
            const { latitude: userLatitude, longitude: userLongitude } = userLocation;
            console.log(`User location: Lat ${userLatitude}, Lon ${userLongitude}`);
            // 2. Fetch events for the selected date
            const events = await fetchEvents(dateDrive);
            if (!events || events.length === 0) {
                console.warn('No events found for the selected date. Setting default addresses.');
                setDefaultAddresses(userLatitude, userLongitude);
                return;
            }

            console.log('Events fetched:', events);

            // 3. Find event details
            const eventDetails = await findEventDetails(events, dateDrive);
            if (!eventDetails) {
                console.warn('No matching event found for the selected date. Setting default addresses.');
                setDefaultAddresses(userLatitude, userLongitude);
                return;
            }

            console.log('Event details:', eventDetails);

            const { location: eventLocation, latitude: eventLatitude, longitude: eventLongitude } = eventDetails;

            // 4. Set addresses based on current time and proximity
            setAddressesBasedOnTimeAndProximity(
                userLatitude,
                userLongitude,
                eventLatitude,
                eventLongitude,
                eventLocation
            );
        } catch (error) {
            console.error('Error in setAutomaticLocation:', error);
        }
    }

    async function getUserLocation() {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser.');
            return null;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error.message);
                    resolve(null);
                }
            );
        });
    }

    async function fetchEvents(dateDrive) {
        try {
            const response = await fetch('php/get_location.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ drive_date: dateDrive }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.statusText}`);
            }

            const data = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return null;
        }
    }

    async function findEventDetails(events, dateDrive) {
        for (const event of events) {
            const eventStartDate = new Date(event.start.dateTime).toISOString().slice(0, 10);

            if (eventStartDate === dateDrive) {
                console.log('Matching event found:', event);

                if (event.location?.displayName) {
                    const geocodeResult = await geocodeLocation(event.location.displayName);
                    if (geocodeResult) {
                        const formattedAddress = await reverseGeocode(geocodeResult.latitude, geocodeResult.longitude);
                        return {
                            location: formattedAddress || event.location.displayName,
                            latitude: geocodeResult.latitude,
                            longitude: geocodeResult.longitude,
                        };
                    }
                }

                return { location: event.location?.displayName || null };
            }
        }

        console.warn('No matching event for the date.');
        return null;
    }


    async function geocodeLocation(location) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
            const geocodeData = await response.json();

            if (geocodeData.length > 0) {
                return {
                    latitude: parseFloat(geocodeData[0].lat),
                    longitude: parseFloat(geocodeData[0].lon),
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return null;
    }
    async function reverseGeocode(lat, lon) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const geocodeData = await response.json();

            if (geocodeData && geocodeData.address) {
                const { road, house_number, postcode, city } = geocodeData.address;
                return `${road || ''} ${house_number || ''}, ${postcode || ''}, ${city || ''}`.trim();
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
        return null;
    }

    async function setAddressesBasedOnTimeAndProximity(userLat, userLon, eventLat, eventLon, eventLocation) {
        const currentHour = new Date().getHours();
        let userAddress = await reverseGeocode(userLat, userLon);
        let eventAddress = eventLocation || (eventLat && eventLon ? await reverseGeocode(eventLat, eventLon) : null);

        if (!userAddress) {
            console.warn('User address unavailable. Using default coordinates.');
            userAddress = `Default Address`;
        }

        if (!eventAddress) {
            console.warn('Event address unavailable. Using user address as fallback.');
            eventAddress = userAddress;
        }

        if (currentHour < 11) {
            setAddresses({ addrStart: userAddress, addrEnd: eventAddress });
        } else if (currentHour >= 13 && calculateDistance(userLat, userLon, eventLat, eventLon) <= 0.1) {
            setAddresses({ addrStart: eventAddress, addrEnd: userAddress });
        } else {
            setDefaultAddresses(userAddress);
        }
    }


    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    function setAddresses({ addrStart, addrEnd }) {
        console.log('Setting addresses:', { addrStart, addrEnd });

        document.getElementById('addr_start').value = addrStart;
        document.getElementById('addr_end').value = addrEnd;
    }

    function setDefaultAddresses(userAddress) {
        console.log('Setting default addresses:', userAddress);

        setAddresses({
            addrStart: userAddress,
            addrEnd: userAddress,
        });
    }

    setAutomaticLocation();

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
