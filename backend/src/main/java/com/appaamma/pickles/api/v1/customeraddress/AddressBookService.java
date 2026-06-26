package com.appaamma.pickles.api.v1.customeraddress;

import com.appaamma.pickles.api.v1.customeraddress.dto.AddressBookEntryResponse;
import com.appaamma.pickles.api.v1.customeraddress.dto.SaveAddressBookEntryRequest;
import com.appaamma.pickles.domain.customer.Address;
import com.appaamma.pickles.domain.customer.AddressRepository;
import com.appaamma.pickles.domain.customer.Customer;
import com.appaamma.pickles.domain.customer.CustomerRepository;
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
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<AddressBookEntryResponse> listMine(CustomerPrincipal principal) {
        return addressRepository.findAllByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(principal.customerId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressBookEntryResponse createMine(CustomerPrincipal principal, SaveAddressBookEntryRequest request) {
        Customer customer = customerRepository.findById(principal.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", principal.customerId()));

        Address address = Address.builder()
                .customer(customer)
                .line1(request.line1().trim())
                .line2(trimToNull(request.line2()))
                .city(request.city().trim())
                .state(request.state().trim())
                .pincode(request.pincode().trim())
                .landmark(trimToNull(request.landmark()))
                .defaultAddress(request.defaultAddress())
                .build();

        if (request.defaultAddress()) {
            clearExistingDefault(customer.getId());
        } else if (addressRepository.findAllByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(customer.getId()).isEmpty()) {
            address.setDefaultAddress(true);
        }

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressBookEntryResponse updateMine(CustomerPrincipal principal, Long addressId, SaveAddressBookEntryRequest request) {
        Address address = addressRepository.findByIdAndCustomerId(addressId, principal.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        address.setLine1(request.line1().trim());
        address.setLine2(trimToNull(request.line2()));
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPincode(request.pincode().trim());
        address.setLandmark(trimToNull(request.landmark()));

        if (request.defaultAddress()) {
            clearExistingDefault(principal.customerId());
            address.setDefaultAddress(true);
        }

        return toResponse(addressRepository.save(address));
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

    private void clearExistingDefault(Long customerId) {
        List<Address> existing = addressRepository.findAllByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(customerId);
        for (Address candidate : existing) {
            if (candidate.isDefaultAddress()) {
                candidate.setDefaultAddress(false);
                addressRepository.save(candidate);
            }
        }
    }

    private AddressBookEntryResponse toResponse(Address address) {
        return new AddressBookEntryResponse(
                address.getId(),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.getLandmark(),
                address.isDefaultAddress()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}