package com.oms.notification.repository;

import com.oms.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByOrderId(Long orderId);

    List<Notification> findByStatus(Notification.NotificationStatus status);
}