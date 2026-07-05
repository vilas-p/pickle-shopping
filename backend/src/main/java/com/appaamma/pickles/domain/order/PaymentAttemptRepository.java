package com.appaamma.pickles.domain.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

    Optional<PaymentAttempt> findByRazorpayOrderId(String razorpayOrderId);
}