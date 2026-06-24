package com.appaamma.pickles.domain.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
	List<Address> findAllByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(Long customerId);
	Optional<Address> findByIdAndCustomerId(Long id, Long customerId);
}
