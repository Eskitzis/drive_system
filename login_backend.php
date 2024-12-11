<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
include('php/db_connection.php');

// Check if the form is submitted via POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the values passed from the form
    $email = $_POST['mail'];
    $password = $_POST['pass'];

    // Prevent injections
    $email = stripslashes($email);
    $password = stripslashes($password);

    // Prepare the SQL query with parameterized inputs to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email); // "s" means the parameter is a string
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if the user exists
    if ($result->num_rows > 0) {
        // Fetch the user data
        $row = $result->fetch_assoc();

        // Check if the plain password matches the stored password
        if ($password == $row['password']) {
            // Successful login: Set session variables and send success response
            $_SESSION['user_role'] = $row['user_role'];
            $_SESSION['logged_id'] = $row['id'];
            echo json_encode(['success' => true]);  // Respond with success
        } else {
            // Invalid password
            echo json_encode(['success' => false, 'error' => 'Incorrect password.']);
        }
    } else {
        // No user found with the provided email
        echo json_encode(['success' => false, 'error' => 'User not found.']);
    }

    // Close the prepared statement and database connection
    $stmt->close();
    $conn->close();
}
?>