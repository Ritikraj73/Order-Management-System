package com.oms.inventory.service;

import com.oms.inventory.dto.InventoryResponse;
import com.oms.inventory.dto.ReserveRequest;
import com.oms.inventory.dto.ReserveResponse;
import com.oms.inventory.entity.Inventory;
import com.oms.inventory.exception.InsufficientStockException;
import com.oms.inventory.exception.InventoryNotFoundException;
import com.oms.inventory.repository.InventoryRepository;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;

    @Transactional
    public ReserveResponse reserveStock(ReserveRequest request) {
        log.info("Reserving stock: productId={}, quantity={}", request.getProductId(), request.getQuantity());

        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + request.getProductId()));

        if (inventory.getQuantity() < request.getQuantity()) {
            log.warn("Insufficient stock for product: {}, available: {}, requested: {}",
                    request.getProductId(), inventory.getQuantity(), request.getQuantity());
            return ReserveResponse.builder()
                    .success(false)
                    .message("Insufficient stock. Available: " + inventory.getQuantity())
                    .version(inventory.getVersion().intValue())
                    .build();
        }

        try {
            int updated = inventoryRepository.reserveStock(
                    request.getProductId(),
                    request.getQuantity(),
                    inventory.getVersion()
            );

            if (updated == 0) {
                log.warn("Concurrent modification detected for product: {}", request.getProductId());
                throw new OptimisticLockException("Concurrent modification detected");
            }

            log.info("Stock reserved successfully for product: {}", request.getProductId());
            return ReserveResponse.builder()
                    .success(true)
                    .message("Stock reserved successfully")
                    .version(inventory.getVersion().intValue() + 1)
                    .build();

        } catch (ObjectOptimisticLockingFailureException | OptimisticLockException e) {
            log.error("Optimistic locking failure for product: {}", request.getProductId());
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventory(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));

        return InventoryResponse.builder()
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .version(inventory.getVersion().intValue())
                .build();
    }

    @Transactional
    public InventoryResponse addStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElse(Inventory.builder()
                        .productId(productId)
                        .quantity(0)
                        .version(0L)
                        .build());

        inventory.setQuantity(inventory.getQuantity() + quantity);
        Inventory saved = inventoryRepository.save(inventory);

        return InventoryResponse.builder()
                .productId(saved.getProductId())
                .quantity(saved.getQuantity())
                .version(saved.getVersion().intValue())
                .build();
    }
}