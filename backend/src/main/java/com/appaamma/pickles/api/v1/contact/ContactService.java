package com.appaamma.pickles.api.v1.contact;

import com.appaamma.pickles.api.v1.contact.dto.ContactRequest;
import com.appaamma.pickles.api.v1.contact.dto.ContactResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.contact.Contact;
import com.appaamma.pickles.domain.contact.ContactRepository;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    @Transactional
    public ContactResponse submit(ContactRequest request) {
        Contact contact = contactMapper.toEntity(request);
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> list(Boolean handled, Pageable pageable) {
        return PageResponse.map(
                handled == null
                        ? contactRepository.findAll(pageable)
                        : contactRepository.findAllByHandled(handled, pageable),
                contactMapper::toResponse);
    }

    @Transactional
    public ContactResponse markHandled(Long id, boolean handled) {
        Contact c = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        c.setHandled(handled);
        return contactMapper.toResponse(contactRepository.save(c));
    }
}
