<?php
class Order {
    private $conn;
    private $table_name = "orders";
    private $order_items_table = "order_items";

    public $id;
    public $user_id;
    public $order_number;
    public $status;
    public $payment_method;
    public $payment_status;
    public $subtotal;
    public $shipping_cost;
    public $service_fee;
    public $total;
    public $shipping_address;
    public $notes;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new order with items
    public function create($items) {
        try {
            $this->conn->beginTransaction();
            
            // Generate order number
            $this->order_number = $this->generateOrderNumber();
            
            // Insert order
            $query = "INSERT INTO " . $this->table_name . "
                      SET user_id=:user_id, order_number=:order_number, 
                          payment_method=:payment_method, subtotal=:subtotal,
                          shipping_cost=:shipping_cost, service_fee=:service_fee,
                          total=:total, shipping_address=:shipping_address, notes=:notes";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":order_number", $this->order_number);
            $stmt->bindParam(":payment_method", $this->payment_method);
            $stmt->bindParam(":subtotal", $this->subtotal);
            $stmt->bindParam(":shipping_cost", $this->shipping_cost);
            $stmt->bindParam(":service_fee", $this->service_fee);
            $stmt->bindParam(":total", $this->total);
            $stmt->bindParam(":shipping_address", $this->shipping_address);
            $stmt->bindParam(":notes", $this->notes);

            if ($stmt->execute()) {
                $order_id = $this->conn->lastInsertId();
                
                // Insert order items
                if ($this->createOrderItems($order_id, $items)) {
                    $this->conn->commit();
                    return $order_id;
                } else {
                    $this->conn->rollback();
                    return false;
                }
            } else {
                $this->conn->rollback();
                return false;
            }
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Order creation error: " . $e->getMessage());
            return false;
        }
    }

    // Create order items
    private function createOrderItems($order_id, $items) {
        $query = "INSERT INTO " . $this->order_items_table . "
                  SET order_id=:order_id, product_id=:product_id, 
                      product_name=:product_name, product_image=:product_image,
                      price=:price, quantity=:quantity, subtotal=:subtotal";

        $stmt = $this->conn->prepare($query);

        foreach ($items as $item) {
            $stmt->bindParam(":order_id", $order_id);
            $stmt->bindParam(":product_id", $item->product_id);
            $stmt->bindParam(":product_name", $item->name);
            $stmt->bindParam(":product_image", $item->image);
            $stmt->bindParam(":price", $item->price);
            $stmt->bindParam(":quantity", $item->quantity);
            $stmt->bindParam(":subtotal", $item->subtotal);

            if (!$stmt->execute()) {
                return false;
            }
        }
        return true;
    }

    // Generate unique order number
    private function generateOrderNumber() {
        $date = date('Ymd');
        $random = str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        return "ORD-{$date}-{$random}";
    }

    // Read single order with items
    public function readOne($order_id, $user_id) {
        $query = "SELECT o.*, u.name as user_name, u.email as user_email
                  FROM " . $this->table_name . " o
                  LEFT JOIN users u ON o.user_id = u.id
                  WHERE o.id = :order_id AND o.user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":order_id", $order_id);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($order) {
            // Get order items
            $order['items'] = $this->getOrderItems($order_id);
            $order['shipping_address'] = json_decode($order['shipping_address'], true);
            return $order;
        }
        return false;
    }

    // Read all orders for a user
    public function readByUser($user_id, $limit = 20, $offset = 0) {
        $query = "SELECT o.*, COUNT(oi.id) as total_items
                  FROM " . $this->table_name . " o
                  LEFT JOIN " . $this->order_items_table . " oi ON o.id = oi.order_id
                  WHERE o.user_id = :user_id
                  GROUP BY o.id
                  ORDER BY o.created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode shipping address for each order
        foreach ($orders as &$order) {
            $order['shipping_address'] = json_decode($order['shipping_address'], true);
        }
        
        return array(
            "records" => $orders,
            "total" => $this->countUserOrders($user_id)
        );
    }

    // Get order items
    private function getOrderItems($order_id) {
        $query = "SELECT * FROM " . $this->order_items_table . " 
                  WHERE order_id = :order_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":order_id", $order_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Count user orders
    private function countUserOrders($user_id) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " 
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    // Update order status
    public function updateStatus($user_id) {
        $query = "UPDATE " . $this->table_name . "
                  SET status=:status, notes=:notes, updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id AND user_id=:user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $user_id);

        return $stmt->execute();
    }

    // Admin methods (untuk admin panel)
    public function readAll($limit = 50, $offset = 0) {
        $query = "SELECT o.*, u.name as user_name, u.email as user_email,
                         COUNT(oi.id) as total_items
                  FROM " . $this->table_name . " o
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN " . $this->order_items_table . " oi ON o.id = oi.order_id
                  GROUP BY o.id
                  ORDER BY o.created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($orders as &$order) {
            $order['shipping_address'] = json_decode($order['shipping_address'], true);
        }
        
        return array(
            "records" => $orders,
            "total" => $this->countAllOrders()
        );
    }

    private function countAllOrders() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
}
?>
