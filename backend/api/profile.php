<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';
include_once '../models/User.php';
include_once '../helpers/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get user profile
        $token = getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(array("message" => "Access denied. No token provided."));
            exit();
        }

        $user_id = validateToken($token);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(array("message" => "Access denied. Invalid token."));
            exit();
        }

        $user->id = $user_id;
        if($user->readOne()) {
            $user_arr = array(
                "id" => (int)$user->id,
                "name" => $user->name,
                "email" => $user->email,
                "phone" => $user->phone,
                "address" => $user->address,
                "role" => $user->role
            );
            
            http_response_code(200);
            echo json_encode(array("user" => $user_arr));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "User not found."));
        }
        break;

    case 'PUT':
        // Update user profile
        $token = getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(array("message" => "Access denied. No token provided."));
            exit();
        }

        $user_id = validateToken($token);
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(array("message" => "Access denied. Invalid token."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->name) && !empty($data->email)) {
            $user->id = $user_id;
            $user->name = $data->name;
            $user->email = $data->email;
            $user->phone = $data->phone ?? '';
            $user->address = $data->address ?? '';

            if($user->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "User profile updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update user profile."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update user profile. Data is incomplete."));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>
