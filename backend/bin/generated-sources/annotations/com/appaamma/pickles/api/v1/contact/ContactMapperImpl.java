package com.appaamma.pickles.api.v1.contact;

import com.appaamma.pickles.api.v1.contact.dto.ContactRequest;
import com.appaamma.pickles.api.v1.contact.dto.ContactResponse;
import com.appaamma.pickles.domain.contact.Contact;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T22:46:21+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ContactMapperImpl implements ContactMapper {

    @Override
    public Contact toEntity(ContactRequest request) {
        if ( request == null ) {
            return null;
        }

        Contact.ContactBuilder contact = Contact.builder();

        contact.fullName( request.fullName() );
        contact.email( request.email() );
        contact.phone( request.phone() );
        contact.subject( request.subject() );
        contact.message( request.message() );

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
