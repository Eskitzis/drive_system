<?php
    session_start();
    include('php/db_connection.php');
    $logged_id = $_SESSION['logged_id'];

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="assets/logo.png" type="image/x-icon">
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar/index.global.min.js'></script>
    <title>Dashboard - Drive</title>
</head>
<body>
    <div id="nav-bar">
        <input id="nav-toggle" type="checkbox" />
        <div id="nav-header"><a id="nav-title" href="dashboard.php" target="_blank"><img src="assets/racing.png" id="img_logo">RIVE</a>
            <label for="nav-toggle"><span id="nav-toggle-burger"></span></label>
            <hr />
        </div>
        <div id="nav-content">
            <div class="nav-button" onclick="window.location.href = 'dashboard.php';"><i class='bx bxs-dashboard'></i><span>Dashboard</span></div>
            <hr />
            <div class="nav-button" onclick="window.location.href = 'drives.php';"><i class='bx bxs-car-crash'></i><span>Drives</span></div>
            <hr />
            <div id="nav-content-highlight"></div>
        </div>
        <input id="nav-footer-toggle" type="checkbox" />
        <div id="nav-footer">
            <div id="nav-footer-heading" onclick="window.location.href = 'settings.php';">
                <div id="nav-footer-avatar"><img src="assets/logo.png" /></div>
                <div id="nav-footer-titlebox"><a id="nav-footer-title" href="settings.php"
                    >Toni</a><span id="nav-footer-subtitle">Einstellungen</span></div>
                <label for="nav-footer-toggle"><i class="fas fa-caret-up"></i></label>
            </div>
        </div>
    </div>
    <div class="dashboard" id="dashboard">
        <div class="dashboard_settings">
            <form id="add_drive">
                <select id="employee_name">
                    <?php
                    $stmt = $conn->prepare("SELECT * FROM users");
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $selected = ($row['id'] == $_SESSION['logged_id']) ? "selected" : "";
                        echo "<option value='" . $row['id'] . "' $selected>" . htmlspecialchars($row['fullname']) . "</option>";                    
                    }
                    ?>
                </select>
                <select id="car_plate">
                    <?php
                        $stmt = $conn->prepare("SELECT * FROM cars");
                        $stmt->execute();
                        $result = $stmt->get_result();
                        while ($row = $result->fetch_assoc()) {
                            echo "<option value='" . $row['id'] . "'>" . $row['plate'] . "</option>";
                        }
                    ?>
                </select>
                <label for="date_drive">Datum:</label>
                <input type="date" id="date_drive" required>
                <label for="addr_start">Von:</label>
                <input type="text" id="addr_start" required>
                <label for="addr_end">Nach:</label>
                <input type="text" id="addr_end" required>
                <label for="km_before">KM Vorher:</label>
                <input type="number" id="km_before" required>
                <label for="km_now">KM Jetzt:</label>
                <input type="number" id="km_now" required>
                <button type="submit">Drive hinzufügen</button>
            </form>
            <hr>
            <div class="previous_drives">
                <div class="list-filter">
                    <input type="date" id="filter-date" placeholder="Filter by Date">
                    <select id="filter-plate">
                        <option value="">Filter by Plate</option>
                        <?php
                            $stmt = $conn->prepare("SELECT * FROM cars");
                            $stmt->execute();
                            $result = $stmt->get_result();
                            while ($row = $result->fetch_assoc()) {
                                echo "<option value='" . $row['plate'] . "'>" . $row['plate'] . "</option>";
                            }
                        ?>
                    </select>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>KM Start</th>
                                <th>KM End</th>
                                <th>Plate</th>
                            </tr>
                        </thead>
                        <tbody id="drives-tbody">
                            <!-- Data rows will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="dashboard_calendar">
            <div id="calendar"></div>
        </div>
    </div>
    <div id="eventModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Drive Details</h3>
            <div id="eventDetails"></div>
        </div>
    </div>
    <script src="js/dashboard.js"></script>
</body>
</html>