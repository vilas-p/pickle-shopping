package com.appaamma.pickles.domain.credential;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "credential_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CredentialEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private CredentialProvider provider;

    @Column(name = "entry_key", nullable = false, length = 100)
    private String entryKey;

    @Column(name = "entry_value", columnDefinition = "TEXT")
    private String entryValue;

    @Column(nullable = false)
    private boolean encrypted;
}
