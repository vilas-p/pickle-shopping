package com.appaamma.pickles.domain.contact;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    Page<Contact> findAllByHandled(boolean handled, Pageable pageable);
}
