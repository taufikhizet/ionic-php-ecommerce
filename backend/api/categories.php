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
include_once '../models/Category.php';

$database = new Database();
$db = $database->getConnection();

$category = new Category($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get single category
            $category->id = $_GET['id'];
            if($category->readOne()) {
                $category_arr = array(
                    "id" => $category->id,
                    "name" => $category->name,
                    "description" => $category->description,
                    "image" => $category->image
                );
                http_response_code(200);
                echo json_encode($category_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Category not found."));
            }
        } else {
            // Get all categories
            $stmt = $category->read();
            $num = $stmt->rowCount();

            if($num > 0) {
                $categories_arr = array();
                $categories_arr["records"] = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $category_item = array(
                        "id" => $id,
                        "name" => $name,
                        "description" => $description,
                        "image" => $image
                    );
                    array_push($categories_arr["records"], $category_item);
                }

                http_response_code(200);
                echo json_encode($categories_arr);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "No categories found."));
            }
        }
        break;

    case 'POST':
        // Create category
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->name)) {
            $category->name = $data->name;
            $category->description = $data->description ?? '';
            $category->image = $data->image ?? '';

            if($category->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Category was created."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create category."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create category. Data is incomplete."));
        }
        break;

    case 'PUT':
        // Update category
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->id) && !empty($data->name)) {
            $category->id = $data->id;
            $category->name = $data->name;
            $category->description = $data->description;
            $category->image = $data->image;

            if($category->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Category was updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update category."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update category. Data is incomplete."));
        }
        break;

    case 'DELETE':
        if(isset($_GET['id'])) {
            $category->id = $_GET['id'];

            if($category->delete()) {
                http_response_code(200);
                echo json_encode(array("message" => "Category was deleted."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete category."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete category. ID is required."));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>
