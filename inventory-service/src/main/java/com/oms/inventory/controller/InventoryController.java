package com.oms.inventory.controller;

import com.oms.inventory.dto.InventoryResponse;
import com.oms.inventory.dto.ReserveRequest;
import com.oms.inventory.dto.ReserveResponse;
import com.oms.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/reserve")
    public ResponseEntity<ReserveResponse> reserveStock(@Valid @RequestBody ReserveRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(request));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventory(productId));
    }

    @PostMapping("/stock")
    public ResponseEntity<InventoryResponse> addStock(
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.addStock(productId, quantity));
    }
}