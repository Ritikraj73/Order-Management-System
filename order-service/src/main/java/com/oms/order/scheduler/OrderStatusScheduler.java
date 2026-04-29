package com.oms.order.scheduler;

import com.oms.order.entity.Order;
import com.oms.order.kafka.OrderEventProducer;
import com.oms.order.kafka.OrderStatusChangedEvent;
import com.oms.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusScheduler.class);

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;

    /**
     * Auto-progress orders through their lifecycle
     * Runs every 30 seconds
     */
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void autoProgressOrders() {
        log.debug("Running order status auto-progression");

        try {
            // Confirm orders that are pending for more than 1 minute
            confirmPendingOrders();

            // Ship orders that are confirmed for more than 2 minutes
            shipConfirmedOrders();

            // Deliver orders that are shipped for more than 3 minutes
            deliverShippedOrders();

        } catch (Exception e) {
            log.error("Error during order auto-progression", e);
        }
    }

    private void confirmPendingOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(1);
        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(
                Order.OrderStatus.PENDING, threshold);

        log.info("Found {} pending orders to confirm", pendingOrders.size());

        for (Order order : pendingOrders) {
            updateOrderStatus(order, Order.OrderStatus.CONFIRMED);
        }
    }

    private void shipConfirmedOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(2);
        List<Order> confirmedOrders = orderRepository.findByStatusAndCreatedAtBefore(
                Order.OrderStatus.CONFIRMED, threshold);

        log.info("Found {} confirmed orders to ship", confirmedOrders.size());

        for (Order order : confirmedOrders) {
            updateOrderStatus(order, Order.OrderStatus.SHIPPED);
        }
    }

    private void deliverShippedOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(3);
        List<Order> shippedOrders = orderRepository.findByStatusAndCreatedAtBefore(
                Order.OrderStatus.SHIPPED, threshold);

        log.info("Found {} shipped orders to deliver", shippedOrders.size());

        for (Order order : shippedOrders) {
            updateOrderStatus(order, Order.OrderStatus.DELIVERED);
        }
    }

    private void updateOrderStatus(Order order, Order.OrderStatus newStatus) {
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        orderRepository.save(order);

        // Publish status change event
        OrderStatusChangedEvent event = OrderStatusChangedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .oldStatus(oldStatus.name())
                .newStatus(newStatus.name())
                .changedAt(LocalDateTime.now())
                .build();

        orderEventProducer.publishOrderStatusChanged(event);

        log.info("Order {} auto-progressed from {} to {}", order.getId(), oldStatus, newStatus);
    }
}