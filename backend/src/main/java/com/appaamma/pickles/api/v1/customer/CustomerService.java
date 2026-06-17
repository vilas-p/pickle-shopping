package com.appaamma.pickles.api.v1.customer;

import com.appaamma.pickles.api.v1.customer.dto.CustomerResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.customer.CustomerRepository;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> search(String q, Pageable pageable) {
        Page<?> page;
        if (StringUtils.hasText(q)) {
            page = customerRepository
                    .findAllByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(q, q, q, pageable);
        } else {
            page = customerRepository.findAll(pageable);
        }
        @SuppressWarnings("unchecked")
        Page<com.appaamma.pickles.domain.customer.Customer> typed =
                (Page<com.appaamma.pickles.domain.customer.Customer>) page;
        return PageResponse.map(typed, customerMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return customerRepository.findById(id)
                .map(customerMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }
}
