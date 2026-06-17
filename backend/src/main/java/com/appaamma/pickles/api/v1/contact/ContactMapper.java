package com.appaamma.pickles.api.v1.contact;

import com.appaamma.pickles.api.v1.contact.dto.ContactRequest;
import com.appaamma.pickles.api.v1.contact.dto.ContactResponse;
import com.appaamma.pickles.domain.contact.Contact;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface ContactMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "handled", constant = "false")
    Contact toEntity(ContactRequest request);

    ContactResponse toResponse(Contact contact);
}
