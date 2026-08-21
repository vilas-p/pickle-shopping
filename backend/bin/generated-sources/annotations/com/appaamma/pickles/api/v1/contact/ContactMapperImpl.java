package com.appaamma.pickles.api.v1.contact;

import com.appaamma.pickles.api.v1.contact.dto.ContactRequest;
import com.appaamma.pickles.api.v1.contact.dto.ContactResponse;
import com.appaamma.pickles.domain.contact.Contact;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T21:28:50+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ContactMapperImpl implements ContactMapper {

    @Override
    public Contact toEntity(ContactRequest request) {
        if ( request == null ) {
            return null;
        }

        Contact.ContactBuilder contact = Contact.builder();

        contact.email( request.email() );
        contact.fullName( request.fullName() );
        contact.message( request.message() );
        contact.phone( request.phone() );
        contact.subject( request.subject() );

        contact.handled( false );

        return contact.build();
    }

    @Override
    public ContactResponse toResponse(Contact contact) {
        if ( contact == null ) {
            return null;
        }

        Long id = null;
        String fullName = null;
        String email = null;
        String phone = null;
        String subject = null;
        String message = null;
        boolean handled = false;
        Instant createdAt = null;

        id = contact.getId();
        fullName = contact.getFullName();
        email = contact.getEmail();
        phone = contact.getPhone();
        subject = contact.getSubject();
        message = contact.getMessage();
        handled = contact.isHandled();
        createdAt = contact.getCreatedAt();

        ContactResponse contactResponse = new ContactResponse( id, fullName, email, phone, subject, message, handled, createdAt );

        return contactResponse;
    }
}
