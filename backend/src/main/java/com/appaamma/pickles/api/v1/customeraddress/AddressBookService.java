package com.appaamma.pickles.api.v1.customeraddress;

import com.appaamma.pickles.api.v1.customeraddress.dto.AddressBookEntryResponse;
import com.appaamma.pickles.domain.customer.Address;
import com.appaamma.pickles.domain.customer.AddressRepository;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.security.CustomerPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressBookService {

    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;

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

    @Transactional
    public void deleteMine(CustomerPrincipal principal, Long addressId) {
        Address address = addressRepository.findByIdAndCustomerId(addressId, principal.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (orderRepository.existsByShippingAddressId(addressId)) {
            throw new BadRequestException("This address is linked to an existing order and cannot be deleted");
        }

        boolean wasDefault = address.isDefaultAddress();
        addressRepository.delete(address);

        if (!wasDefault) {
            return;
        }

        List<Address> remaining = addressRepository.findAllByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(principal.customerId());
        if (remaining.isEmpty()) {
            return;
        }

        Address nextDefault = remaining.get(0);
        nextDefault.setDefaultAddress(true);
        addressRepository.save(nextDefault);
    }
}