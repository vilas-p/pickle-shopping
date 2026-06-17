package com.appaamma.pickles.domain.user;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RoleName name;

    public enum RoleName {
        ROLE_ADMIN,
        ROLE_STAFF,
        ROLE_CUSTOMER
    }
}
