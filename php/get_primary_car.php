<?php
// Include your database connection here
include('db_connection.php');

// Check if the user_id is provided
if (isset($_GET['user_id'])) {
    $userId = $_GET['user_id'];

    // Prepare a query to get the primary car for the user
    $stmt = $conn->prepare("SELECT primary_car FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId); // Bind the user ID parameter
    $stmt->execute();
    $stmt->bind_result($primaryCarId);
    $stmt->fetch();
    $stmt->close();

    // Return the primary car ID as a response
    echo $primaryCarId;
}
?>