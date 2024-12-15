<?php
    session_start();
    include('php/db_connection.php');
    if (!isset($_SESSION['logged_id'])) {
        header('Location: index.php');
        exit();
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Drive</title>
</head>
<body>
    
</body>
</html>