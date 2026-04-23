package com.oms.inventory.repository;

import com.oms.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :quantity, i.version = i.version + 1 " +
           "WHERE i.productId = :productId AND i.quantity >= :quantity AND i.version = :version")
    int reserveStock(@Param("productId") Long productId,
                      @Param("quantity") Integer quantity,
                      @Param("version") Long version);
}