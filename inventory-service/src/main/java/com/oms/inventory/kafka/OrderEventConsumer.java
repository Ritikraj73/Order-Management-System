package com.oms.inventory.kafka;

import com.oms.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    private final InventoryService inventoryService;

    @KafkaListener(topics = "${kafka.topic.order-created:order-created-events}",
            groupId = "${spring.kafka.consumer.group-id:inventory-group}")
    public void consumeOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent: orderId={}, userId={}, items={}",
                event.getOrderId(), event.getUserId(), event.getItems().size());

        try {
            // Deduct stock for each item in the order
            for (OrderCreatedEvent.OrderItemEvent item : event.getItems()) {
                log.info("Deducting stock for productId={}, quantity={}",
                        item.getProductId(), item.getQuantity());
                inventoryService.deductStock(item.getProductId(), item.getQuantity());
            }

            log.info("Stock deducted successfully for order: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Error deducting stock for order: {}", event.getOrderId(), e);
            // In a real system, you might want to publish a failure event or retry
        }
    }
}