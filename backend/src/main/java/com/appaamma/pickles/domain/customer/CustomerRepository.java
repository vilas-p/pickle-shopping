package com.appaamma.pickles.domain.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmailIgnoreCase(String email);
    Optional<Customer> findByPhone(String phone);
    Page<Customer> findAllByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(
            String name, String email, String phone, Pageable pageable);
}
