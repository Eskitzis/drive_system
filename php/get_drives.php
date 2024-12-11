<?php
// Include the database connection
include 'db_connection.php'; // Ensure this path is correct

// Check if employee_id is provided in the URL query parameters
if (isset($_GET['employee_id'])) {
    $employee_id = (int) $_GET['employee_id']; // Sanitize the employee_id to an integer

    // Query to get the drives for the selected employee
    $query = "
        SELECT 
            drives.drive_date, 
            drives.km_start, 
            drives.km_end, 
            cars.plate
        FROM 
            drives
        JOIN 
            cars ON drives.car_id = cars.id
        WHERE 
            drives.user_id = ?"; // Using prepared statements for security

    // Prepare the query
    if ($stmt = $conn->prepare($query)) {
        // Bind the employee_id parameter
        $stmt->bind_param("i", $employee_id);

        // Execute the query
        $stmt->execute();

        // Bind the result to variables
        $stmt->bind_result($drive_date, $km_start, $km_end, $plate);

        // Fetch the results and store them in an array
        $drives = [];
        while ($stmt->fetch()) {
            $drives[] = [
                'drive_date' => $drive_date,
                'km_start' => $km_start,
                'km_end' => $km_end,
                'plate' => $plate
            ];
        }

        // Close the statement
        $stmt->close();

        // Return the result as JSON
        echo json_encode($drives);
    } else {
        echo json_encode(['error' => 'Failed to prepare statement']);
    }
} else {
    // Return error if employee_id is not provided
    echo json_encode(['error' => 'Employee ID is required']);
}

// Close the database connection
$conn->close();
?>