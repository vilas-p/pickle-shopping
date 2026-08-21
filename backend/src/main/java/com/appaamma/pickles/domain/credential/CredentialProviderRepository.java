package com.appaamma.pickles.domain.credential;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CredentialProviderRepository extends JpaRepository<CredentialProvider, Long> {
    Optional<CredentialProvider> findByCategory(String category);

    Optional<CredentialProvider> findByCategoryAndActiveTrue(String category);

    Optional<CredentialProvider> findByCodeAndActiveTrue(String code);
}
