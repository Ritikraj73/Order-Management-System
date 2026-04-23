package com.oms.order.service;

import com.oms.order.client.InventoryClient;
import com.oms.order.client.ProductClient;
import com.oms.order.dto.*;
import com.oms.order.entity.Order;
import com.oms.order.entity.OrderItem;
import com.oms.order.exception.InsufficientStockException;
import com.oms.order.kafka.OrderEventProducer;
import com.oms.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductClient productClient;

    @Mock
    private InventoryClient inventoryClient;

    @Mock
    private OrderEventProducer orderEventProducer;

    @InjectMocks
    private OrderService orderService;

    private OrderRequest orderRequest;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        orderRequest = new OrderRequest(List.of(
                new OrderRequest.OrderItemRequest(1L, 2)
        ));

        productResponse = ProductResponse.builder()
                .id(1L)
                .name("Test Product")
                .price(new BigDecimal("99.99"))
                .category("Electronics")
                .build();
    }

    @Test
    void createOrder_shouldCreateOrder_whenStockAvailable() {
        when(productClient.getProduct(1L)).thenReturn(productResponse);
        when(inventoryClient.reserve(any(ReserveRequest.class))).thenReturn(
                ReserveResponse.builder().success(true).build()
        );
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            order.setCreatedAt(LocalDateTime.now());
            return order;
        });

        OrderResponse result = orderService.createOrder(1L, "testuser", orderRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(new BigDecimal("199.98"), result.getTotalAmount());
        verify(orderRepository).save(any(Order.class));
        verify(orderEventProducer).publishOrderCreated(any());
    }

    @Test
    void createOrder_shouldThrowException_whenStockInsufficient() {
        when(productClient.getProduct(1L)).thenReturn(productResponse);
        when(inventoryClient.reserve(any(ReserveRequest.class))).thenReturn(
                ReserveResponse.builder().success(false).message("Insufficient stock").build()
        );

        assertThrows(InsufficientStockException.class,
                () -> orderService.createOrder(1L, "testuser", orderRequest));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void getOrdersByUser_shouldReturnOrders() {
        Order order = Order.builder()
                .id(1L)
                .userId(1L)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(new BigDecimal("199.98"))
                .items(List.of(OrderItem.builder()
                        .productId(1L)
                        .quantity(2)
                        .price(new BigDecimal("99.99"))
                        .build()))
                .createdAt(LocalDateTime.now())
                .build();

        when(orderRepository.findByUserId(eq(1L), any())).thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(order)));

        List<OrderResponse> result = orderService.getOrdersByUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
}