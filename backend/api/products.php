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
include_once '../models/Product.php';
include_once '../helpers/auth.php';

$database = new Database();
$db = $database->getConnection();

$product = new Product($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get single product
            $product->id = $_GET['id'];
            if($product->readOne()) {
                $product_arr = array(
                    "id" => (int)$product->id,
                    "category_id" => (int)$product->category_id,
                    "category_name" => $product->category_name,
                    "name" => $product->name,
                    "description" => $product->description,
                    "price" => (int)$product->price, // Integer for Rupiah (no decimal)
                    "stock" => (int)$product->stock,
                    "image" => $product->image,
                    "rating" => (float)$product->rating,
                    "review_count" => (int)$product->review_count
                );
                
                $response = array(
                    "product" => $product_arr,
                    "message" => "Product retrieved successfully."
                );
                
                http_response_code(200);
                echo json_encode($response);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Product not found."));
            }
        } elseif(isset($_GET['category_id'])) {
            // Get products by category
            $stmt = $product->readByCategory($_GET['category_id']);
            $num = $stmt->rowCount();

            if($num > 0) {
                $products_arr = array();
                $products_arr["records"] = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $product_item = array(
                        "id" => $id,
                        "category_id" => $category_id,
                        "category_name" => $category_name,
                        "name" => $name,
                        "description" => $description,
                        "price" => (int)$price, // Integer for Rupiah (no decimal)
                        "stock" => $stock,
                        "image" => $image,
                        "rating" => $rating,
                        "review_count" => $review_count
                    );
                    array_push($products_arr["records"], $product_item);
                }

                http_response_code(200);
                echo json_encode($products_arr);
            } else {
                // Return empty array instead of error for empty categories
                $products_arr = array();
                $products_arr["records"] = array();
                http_response_code(200);
                echo json_encode($products_arr);
            }
        } elseif(isset($_GET['search'])) {
            // Search products
            $stmt = $product->search($_GET['search']);
            $num = $stmt->rowCount();

            if($num > 0) {
                $products_arr = array();
                $products_arr["records"] = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $product_item = array(
                        "id" => $id,
                        "category_id" => $category_id,
                        "category_name" => $category_name,
                        "name" => $name,
                        "description" => $description,
                        "price" => (int)$price, // Integer for Rupiah (no decimal)
                        "stock" => $stock,
                        "image" => $image,
                        "rating" => $rating,
                        "review_count" => $review_count
                    );
                    array_push($products_arr["records"], $product_item);
                }

                http_response_code(200);
                echo json_encode($products_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No products found."));
            }
        } else {
            // Get all products
            $stmt = $product->read();
            $num = $stmt->rowCount();

            if($num > 0) {
                $products_arr = array();
                $products_arr["records"] = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $product_item = array(
                        "id" => $id,
                        "category_id" => $category_id,
                        "category_name" => $category_name,
                        "name" => $name,
                        "description" => $description,
                        "price" => (int)$price, // Integer for Rupiah (no decimal)
                        "stock" => $stock,
                        "image" => $image,
                        "rating" => $rating,
                        "review_count" => $review_count
                    );
                    array_push($products_arr["records"], $product_item);
                }

                http_response_code(200);
                echo json_encode($products_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No products found."));
            }
        }
        break;

    case 'POST':
        // Create product - Admin only
        $headers = getallheaders();
        $adminId = validateAdminToken($headers);
        
        if(!$adminId) {
            http_response_code(401);
            echo json_encode(array("message" => "Admin access required."));
            break;
        }
        
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->name) && !empty($data->price) && !empty($data->category_id)) {
            $product->category_id = $data->category_id;
            $product->name = $data->name;
            $product->description = $data->description ?? '';
            $product->price = $data->price;
            $product->stock = $data->stock ?? 0;
            $product->image = $data->image ?? '';

            if($product->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Product was created."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create product."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create product. Data is incomplete."));
        }
        break;

    case 'PUT':
        // Update product - Admin only
        $headers = getallheaders();
        $adminId = validateAdminToken($headers);
        
        if(!$adminId) {
            http_response_code(401);
            echo json_encode(array("message" => "Admin access required."));
            break;
        }
        
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->id) && !empty($data->name) && !empty($data->price)) {
            $product->id = $data->id;
            $product->category_id = $data->category_id;
            $product->name = $data->name;
            $product->description = $data->description;
            $product->price = $data->price;
            $product->stock = $data->stock;
            $product->image = $data->image;

            if($product->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Product was updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update product."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update product. Data is incomplete."));
        }
        break;

    case 'DELETE':
        // Delete product - Admin only
        $headers = getallheaders();
        $adminId = validateAdminToken($headers);
        
        if(!$adminId) {
            http_response_code(401);
            echo json_encode(array("message" => "Admin access required."));
            break;
        }
        
        if(isset($_GET['id'])) {
            $product->id = $_GET['id'];

            if($product->delete()) {
                http_response_code(200);
                echo json_encode(array("message" => "Product was deleted."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete product."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete product. ID is required."));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>
