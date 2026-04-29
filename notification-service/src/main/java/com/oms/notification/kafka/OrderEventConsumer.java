package com.oms.notification.kafka;

import com.oms.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    private final NotificationService notificationService;

    @KafkaListener(topics = "${kafka.topic.order-created:order-created-events}",
                   groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void consumeOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent: orderId={}, userId={}, totalAmount={}",
                event.getOrderId(), event.getUserId(), event.getTotalAmount());

        String message = buildOrderConfirmationMessage(event);

        notificationService.createNotification(
                event.getUserId(),
                event.getOrderId(),
                "ORDER_CONFIRMATION",
                "Order Confirmation - #" + event.getOrderId(),
                message
        );

        log.info("Notification created for order: {}", event.getOrderId());
    }

    private String buildOrderConfirmationMessage(OrderCreatedEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("Dear ").append(event.getUsername()).append(",\n\n");
        sb.append("Thank you for your order! Here are your order details:\n\n");
        sb.append("Order ID: ").append(event.getOrderId()).append("\n");
        sb.append("Total Amount: $").append(event.getTotalAmount()).append("\n\n");
        sb.append("Items:\n");

        for (OrderCreatedEvent.OrderItemEvent item : event.getItems()) {
            sb.append("  - ").append(item.getProductName())
              .append(" x ").append(item.getQuantity())
              .append(" @ $").append(item.getPrice()).append("\n");
        }

        sb.append("\nWe will notify you when your order ships.\n");
        sb.append("\nBest regards,\nOMS Team");

        return sb.toString();
    }
    @KafkaListener(topics = "${kafka.topic.order-status-changed:order-status-changed-events}",
            groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void consumeOrderStatusChangedEvent(OrderStatusChangedEvent event) {
        log.info("Received OrderStatusChangedEvent: orderId={}, userId={}, status: {}->{}",
                event.getOrderId(), event.getUserId(), event.getOldStatus(), event.getNewStatus());
        String subject = "Order #" + event.getOrderId() + " - " + formatStatus(event.getNewStatus());
        String message = buildStatusChangeMessage(event);
        notificationService.createNotification(
                event.getUserId(),
                event.getOrderId(),
                "ORDER_STATUS_UPDATE",
                subject,
                message );
        log.info("Notification created for order status change: {}", event.getOrderId());
    }

    private String formatStatus(String status) {
        return switch (status) {
            case "CONFIRMED" -> "Confirmed";
            case "SHIPPED" -> "Shipped";
            case "DELIVERED" -> "Delivered";
            case "CANCELLED" -> "Cancelled";
            default -> status; };
    }
    private String buildStatusChangeMessage(OrderStatusChangedEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your order #").append(event.getOrderId()).append(" status has been updated.\n\n");
        sb.append("Status: ").append(event.getOldStatus()).append(" → ").append(event.getNewStatus()).append("\n\n");

        sb.append(switch (event.getNewStatus()) {
            case "CONFIRMED" -> "Your order has been confirmed and is being prepared for shipment.";
            case "SHIPPED" -> "Your order has been shipped and is on its way to you!";
            case "DELIVERED" -> "Your order has been delivered. Thank you for your purchase!";
            case "CANCELLED" -> "Your order has been cancelled.";
            default -> "Your order status has been updated.";
        });
        sb.append("\n\nBest regards,\nOMS Team");

        return sb.toString();
    }
}