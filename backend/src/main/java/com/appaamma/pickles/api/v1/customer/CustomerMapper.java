package com.appaamma.pickles.api.v1.customer;

import com.appaamma.pickles.api.v1.customer.dto.CustomerResponse;
import com.appaamma.pickles.domain.customer.Customer;
import org.mapstruct.Mapper;

@Mapper
public interface CustomerMapper {
    CustomerResponse toResponse(Customer customer);
}
