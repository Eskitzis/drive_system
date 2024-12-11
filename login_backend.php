<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
//values passed from index form
$email = $_POST['email'];
$password = $_POST['password'];
//prevent injections
$email = stripcslashes($email);
$password = stripcslashes($password);

include('db_connection.php');
//Query the database for user
$result = mysqli_query($conn, "select * from users where email = '$email' and password = '$password'")
    or die("Failed to query database" . mysql_error());
$row = mysqli_fetch_array($result, MYSQLI_BOTH);

if ($row['email'] == $email && $row['password'] == $password) {
    session_start();
    $_SESSION['user_role'] = $row['user_role'];
    $_SESSION['logged_id'] = $row['id'];
    //ACTIVE SESSION
    $session_id = session_id();
    header("Location: dashboard.php");
} else {
    header("Location: index.html");
}
?>