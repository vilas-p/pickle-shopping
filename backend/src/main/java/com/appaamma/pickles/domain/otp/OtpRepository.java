package com.appaamma.pickles.domain.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpToken, Long> {

    /**
     * Returns the latest usable (unconsumed, unexpired, attempts &lt; maxAttempts) token for
     * the given identifier + purpose, if any.
     */
    @Query("""
        select o from OtpToken o
         where o.identifier = :identifier
           and o.purpose = :purpose
           and o.consumedAt is null
           and o.expiresAt > :now
           and o.attempts < o.maxAttempts
         order by o.id desc
        """)
    Optional<OtpToken> findLatestUsable(
            @Param("identifier") String identifier,
            @Param("purpose") OtpPurpose purpose,
            @Param("now") Instant now
    );

    /**
     * Counts tokens issued for an identifier within a window — used to enforce rate limits.
     */
    @Query("""
        select count(o) from OtpToken o
         where o.identifier = :identifier
           and o.createdAt >= :since
        """)
    long countSince(@Param("identifier") String identifier, @Param("since") Instant since);

    /**
     * Housekeeping query — deletes expired or consumed rows. Wire to a scheduler later.
     */
    @Modifying
    @Query("delete from OtpToken o where o.expiresAt < :cutoff or o.consumedAt is not null")
    int deleteExpiredOrConsumed(@Param("cutoff") Instant cutoff);
}
