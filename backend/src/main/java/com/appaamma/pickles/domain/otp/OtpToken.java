package com.appaamma.pickles.domain.otp;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A one-time password issued to an identifier (phone or email). The actual code is never
 * stored — only a bcrypt hash. Verification compares against the hash and increments
 * {@link #attempts}, locking the token once attempts hit {@link #maxAttempts}.
 */
@Entity
@Table(name = "otp_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String identifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "identifier_kind", nullable = false, length = 20)
    private OtpIdentifierKind identifierKind;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OtpPurpose purpose;

    @Column(name = "code_hash", nullable = false, length = 255)
    private String codeHash;

    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 5;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isConsumed() {
        return consumedAt != null;
    }

    public boolean isUsable() {
        return !isConsumed() && !isExpired() && attempts < maxAttempts;
    }
}
