package com.oms.order.service;

import com.oms.order.client.InventoryClient;
import com.oms.order.client.ProductClient;
import com.oms.order.dto.*;
import com.oms.order.entity.Order;
import com.oms.order.entity.OrderItem;
import com.oms.order.exception.InsufficientStockException;
import com.oms.order.exception.OrderProcessingException;
import com.oms.order.kafka.OrderCreatedEvent;
import com.oms.order.kafka.OrderEventProducer;
import com.oms.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final OrderEventProducer orderEventProducer;

    @Transactional
    public OrderResponse createOrder(Long userId, String username, OrderRequest request) {
        log.info("Creating order for user: {} with {} items", userId, request.getItems().size());

        List<OrderCreatedEvent.OrderItemEvent> eventItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .userId(userId)
                .status(Order.OrderStatus.PENDING)
                .build();

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            log.debug("Processing item: productId={}, quantity={}", itemRequest.getProductId(), itemRequest.getQuantity());

            ProductResponse product = productClient.getProduct(itemRequest.getProductId());
            log.debug("Fetched product: {} with price: {}", product.getName(), product.getPrice());

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            ReserveResponse reserveResponse = inventoryClient.reserve(
                    new ReserveRequest(itemRequest.getProductId(), itemRequest.getQuantity())
            );

            if (!reserveResponse.isSuccess()) {
                log.error("Insufficient stock for product: {}", itemRequest.getProductId());
                throw new InsufficientStockException("Insufficient stock for product: " + itemRequest.getProductId());
            }

            OrderItem orderItem = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productName(product.getName())
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build();
            order.addItem(orderItem);

            eventItems.add(OrderCreatedEvent.OrderItemEvent.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        log.info("Order saved with id: {} and total: {}", savedOrder.getId(), totalAmount);

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .userId(userId)
                .username(username)
                .totalAmount(totalAmount)
                .items(eventItems)
                .createdAt(savedOrder.getCreatedAt())
                .build();

        orderEventProducer.publishOrderCreated(event);

        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Long userId) {
        log.debug("Fetching orders for user: {}", userId);
        return orderRepository.findByUserId(userId, org.springframework.data.domain.Pageable.unpaged())
                .map(this::toResponse)
                .stream()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .map(this::toResponse)
                .orElseThrow(() -> new OrderProcessingException("Order not found: " + orderId));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemDto.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }
}