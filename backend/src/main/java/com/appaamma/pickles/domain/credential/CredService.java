package com.appaamma.pickles.domain.credential;

import com.appaamma.pickles.exception.ResourceNotFoundException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CredService {

    private final CredentialProviderRepository credentialProviderRepository;

    public CredService(CredentialProviderRepository credentialProviderRepository) {
        this.credentialProviderRepository = credentialProviderRepository;
    }

    public Map<String, String> getActiveCredentialEntriesByCategory(String category) {
        return credentialProviderRepository.findByCategoryAndActiveTrue(category)
            .map(provider -> provider.getEntries().stream()
                .collect(Collectors.toMap(
                    CredentialEntry::getEntryKey,
                    entry -> entry.getEntryValue() == null ? "" : entry.getEntryValue(),
                    (left, right) -> right
                )))
            .orElse(Collections.emptyMap());
    }

    public Map<String, String> getActiveCredentialEntriesByProviderCode(String providerCode) {
        return credentialProviderRepository.findByCodeAndActiveTrue(providerCode)
            .map(provider -> provider.getEntries().stream()
                .collect(Collectors.toMap(
                    CredentialEntry::getEntryKey,
                    entry -> entry.getEntryValue() == null ? "" : entry.getEntryValue(),
                    (left, right) -> right
                )))
            .orElse(Collections.emptyMap());
    }

    public boolean isProviderActive(String providerCode) {
        return credentialProviderRepository.findByCodeAndActiveTrue(providerCode).isPresent();
    }

    public CredentialProvider getEntryValue(String category) {
        CredentialProvider provider = credentialProviderRepository.findByCategoryAndActiveTrue(category)
                .orElseThrow(() -> new ResourceNotFoundException("CredentialProvider", "category", category));
        return provider;
    }
}
