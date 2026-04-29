package com.oms.order.kafka;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.order-created}")
    private String orderCreatedTopic;

    @Value("${kafka.topic.order-status-changed}")
    private String orderStatusChangedTopic;

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("Publishing OrderCreatedEvent for order: {} to topic: {}", event.getOrderId(), orderCreatedTopic);
        kafkaTemplate.send(orderCreatedTopic, String.valueOf(event.getOrderId()), event);
        log.debug("OrderCreatedEvent published successfully");
    }

    public void publishOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("Publishing OrderStatusChangedEvent for order: {} ({}->{})",
                event.getOrderId(), event.getOldStatus(), event.getNewStatus());
        kafkaTemplate.send(orderStatusChangedTopic, String.valueOf(event.getOrderId()), event);
        log.debug("OrderStatusChangedEvent published successfully");
    }

}