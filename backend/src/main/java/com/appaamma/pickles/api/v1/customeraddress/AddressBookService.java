package com.appaamma.pickles.api.v1.customeraddress;

import com.appaamma.pickles.api.v1.customeraddress.dto.AddressBookEntryResponse;
import com.appaamma.pickles.domain.customer.AddressRepository;
import com.appaamma.pickles.security.CustomerPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressBookService {

    private final AddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<AddressBookEntryResponse> listMine(CustomerPrincipal principal) {
        return addressRepository.findAllByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(principal.customerId())
                .stream()
                .map(address -> new AddressBookEntryResponse(
                        address.getId(),
                        address.getLine1(),
                        address.getLine2(),
                        address.getCity(),
                        address.getState(),
                        address.getPincode(),
                        address.getLandmark(),
                        address.isDefaultAddress()
                ))
                .toList();
    }
}