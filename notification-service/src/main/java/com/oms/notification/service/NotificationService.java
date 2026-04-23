package com.oms.notification.service;

import com.oms.notification.entity.Notification;
import com.oms.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Long userId, Long orderId, String type,
                                           String subject, String message) {
        log.info("Creating notification: type={}, userId={}, orderId={}", type, userId, orderId);

        Notification notification = Notification.builder()
                .userId(userId)
                .orderId(orderId)
                .type(type)
                .subject(subject)
                .message(message)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.debug("Notification saved with id: {}", saved.getId());

        sendNotification(saved);

        return saved;
    }

    private void sendNotification(Notification notification) {
        log.info("Sending {} notification to user {}: {}",
                notification.getType(), notification.getUserId(), notification.getSubject());

        notification.setStatus(Notification.NotificationStatus.SENT);
        notification.setSentAt(java.time.LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notification sent successfully to user {}", notification.getUserId());
    }

    @Transactional(readOnly = true)
    public Notification getNotification(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
    }
}