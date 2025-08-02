<?php
// Enable error logging for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';
include_once '../models/Order.php';
include_once '../helpers/auth.php';

$database = new Database();
$db = $database->getConnection();
$order = new Order($db);

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();

// Get and validate token
$token = getBearerToken($headers);
if (!$token) {
    http_response_code(401);
    echo json_encode(array("message" => "Access token required"));
    exit();
}

$user_data = validateToken($token);
if (!$user_data) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid or expired token"));
    exit();
}

$user_id = $user_data; // validateToken returns user_id directly

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single order
            $order_id = $_GET['id'];
            $result = $order->readOne($order_id, $user_id);
            
            if ($result) {
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Order not found"));
            }
        } else {
            // Get all user orders
            $result = $order->readByUser($user_id);
            echo json_encode($result);
        }
        break;
        
    case 'POST':
        // Create new order
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || !isset($data->items) || empty($data->items)) {
            http_response_code(400);
            echo json_encode(array("message" => "Order items are required"));
            break;
        }
        
        if (!isset($data->shipping_address) || !isset($data->payment_method)) {
            http_response_code(400);
            echo json_encode(array("message" => "Shipping address and payment method are required"));
            break;
        }
        
        // Set order properties
        $order->user_id = $user_id;
        $order->payment_method = $data->payment_method;
        $order->subtotal = $data->subtotal ?? 0;
        $order->shipping_cost = $data->shipping_cost ?? 0;
        $order->service_fee = $data->service_fee ?? 0;
        $order->total = $data->total ?? ($order->subtotal + $order->shipping_cost + $order->service_fee);
        $order->shipping_address = json_encode($data->shipping_address);
        $order->notes = $data->notes ?? '';
        
        try {
            // Create order
            $order_id = $order->create($data->items);
            
            if ($order_id) {
                // Get the created order data
                $created_order = $order->readOne($order_id, $user_id);
                
                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Order created successfully",
                    "data" => $created_order
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Failed to create order"
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Error creating order: " . $e->getMessage()
            ));
        }
        break;
        
    case 'PUT':
        // Update order status (admin only or specific cases)
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($_GET['id']) || !$data || !isset($data->status)) {
            http_response_code(400);
            echo json_encode(array("message" => "Order ID and status are required"));
            break;
        }
        
        $order_id = $_GET['id'];
        $order->id = $order_id;
        $order->status = $data->status;
        $order->notes = $data->notes ?? '';
        
        if ($order->updateStatus($user_id)) {
            echo json_encode(array(
                "success" => true,
                "message" => "Order status updated successfully"
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to update order status"
            ));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>
