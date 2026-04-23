package com.oms.order.client;

import com.oms.order.dto.InventoryResponse;
import com.oms.order.dto.ReserveRequest;
import com.oms.order.dto.ReserveResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "${services.inventory.url}")
public interface InventoryClient {

    @PostMapping("/inventory/reserve")
    ReserveResponse reserve(@RequestBody ReserveRequest request);
}