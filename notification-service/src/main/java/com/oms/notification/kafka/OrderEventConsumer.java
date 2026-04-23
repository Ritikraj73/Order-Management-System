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
}