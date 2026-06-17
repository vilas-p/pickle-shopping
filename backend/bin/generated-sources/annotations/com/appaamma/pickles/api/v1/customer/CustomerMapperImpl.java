package com.appaamma.pickles.api.v1.customer;

import com.appaamma.pickles.api.v1.customer.dto.CustomerResponse;
import com.appaamma.pickles.domain.customer.Customer;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T22:46:21+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public CustomerResponse toResponse(Customer customer) {
        if ( customer == null ) {
            return null;
        }

        Long id = null;
        String fullName = null;
        String email = null;
        String phone = null;
        Instant createdAt = null;

        id = customer.getId();
        fullName = customer.getFullName();
        email = customer.getEmail();
        phone = customer.getPhone();
        createdAt = customer.getCreatedAt();

        CustomerResponse customerResponse = new CustomerResponse( id, fullName, email, phone, createdAt );

        return customerResponse;
    }
}
