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
include_once '../models/Cart.php';

$database = new Database();
$db = $database->getConnection();

$cart = new Cart($db);

$method = $_SERVER['REQUEST_METHOD'];

// Simple token validation (in production, use proper JWT validation)
function validateToken($headers) {
    if(isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        if(count($parts) == 2) {
            return $parts[0]; // Return user ID
        }
    }
    return false;
}

$headers = getallheaders();
$user_id = validateToken($headers);

if(!$user_id) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token."));
    exit();
}

switch($method) {
    case 'GET':
        // Get cart items for user
        $stmt = $cart->readByUser($user_id);
        $num = $stmt->rowCount();

        if($num > 0) {
            $cart_arr = array();
            $cart_arr["records"] = array();
            $total = 0;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $subtotal = $quantity * $price;
                $total += $subtotal;
                
                $cart_item = array(
                    "id" => $id,
                    "product_id" => $product_id,
                    "name" => $name,
                    "price" => (int)$price, // Integer for Rupiah (no decimal)
                    "quantity" => $quantity,
                    "image" => $image,
                    "stock" => $stock,
                    "subtotal" => $subtotal
                );
                array_push($cart_arr["records"], $cart_item);
            }

            $cart_arr["total"] = $total;
            http_response_code(200);
            echo json_encode($cart_arr);
        } else {
            http_response_code(200);
            echo json_encode(array("records" => array(), "total" => 0));
        }
        break;

    case 'POST':
        // Add item to cart
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->product_id) && !empty($data->quantity)) {
            $cart->user_id = $user_id;
            $cart->product_id = $data->product_id;
            $cart->quantity = $data->quantity;

            if($cart->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Product added to cart."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to add product to cart."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to add to cart. Data is incomplete."));
        }
        break;

    case 'PUT':
        // Update cart item quantity
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->id) && isset($data->quantity)) {
            $cart->id = $data->id;
            $cart->user_id = $user_id;
            $cart->quantity = $data->quantity;

            if($cart->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Cart item was updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update cart item."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update cart item. Data is incomplete."));
        }
        break;

    case 'DELETE':
        if(isset($_GET['id'])) {
            $cart->id = $_GET['id'];
            $cart->user_id = $user_id;

            if($cart->delete()) {
                http_response_code(200);
                echo json_encode(array("message" => "Cart item was removed."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to remove cart item."));
            }
        } elseif(isset($_GET['clear']) && $_GET['clear'] == 'all') {
            // Clear all cart items for user
            if($cart->clearCart($user_id)) {
                http_response_code(200);
                echo json_encode(array("message" => "Cart cleared successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to clear cart."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to remove cart item. ID is required."));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>
