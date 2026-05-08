package com.soccerdev.player;

import com.soccerdev.common.BaseIdEntity;
import com.soccerdev.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "parent_player_relationships", indexes = {
        @Index(name = "idx_ppr_parent_user_id", columnList = "parent_user_id"),
        @Index(name = "idx_ppr_player_id", columnList = "player_id")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uq_ppr_parent_player",
                columnNames = {"parent_user_id", "player_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentPlayerRelationship extends BaseIdEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private User parentUser;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false, length = 30)
    private RelationshipType relationshipType;
}
