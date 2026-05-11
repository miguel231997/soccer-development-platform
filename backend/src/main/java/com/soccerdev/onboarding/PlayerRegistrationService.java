package com.soccerdev.onboarding;

import com.soccerdev.player.ParentPlayerRelationship;
import com.soccerdev.player.ParentPlayerRelationshipRepository;
import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.player.RelationshipType;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.team.CoachTeamAssignmentRepository;
import com.soccerdev.team.PlayerTeamAssignment;
import com.soccerdev.team.PlayerTeamAssignmentRepository;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamMembershipRepository;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerRegistrationService {

    private final PlayerRegistrationRepository playerRegistrationRepository;
    private final TeamRepository teamRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final PlayerRepository playerRepository;
    private final ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    private final PlayerTeamAssignmentRepository playerTeamAssignmentRepository;
    private final CoachTeamAssignmentRepository coachTeamAssignmentRepository;
    private final AuthorizationService authorizationService;

    @Transactional
    public PlayerRegistrationResponse create(User parent, PlayerRegistrationInput input) {
        if (parent.getRole() != UserRole.PARENT) {
            throw new AccessDeniedException("Only PARENT users can submit player registration requests");
        }

        Team team = teamRepository.findById(input.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + input.getTeamId()));

        if (!teamMembershipRepository.existsByUserIdAndTeamId(parent.getId(), team.getId())) {
            throw new AccessDeniedException("You are not a member of this team");
        }

        PlayerRegistrationRequest request = PlayerRegistrationRequest.builder()
                .parentUser(parent)
                .team(team)
                .firstName(input.getFirstName())
                .lastName(input.getLastName())
                .dateOfBirth(input.getDateOfBirth())
                .primaryPosition(input.getPrimaryPosition())
                .secondaryPosition(input.getSecondaryPosition())
                .strongFoot(input.getStrongFoot())
                .jerseyNumber(input.getJerseyNumber())
                .status(RegistrationStatus.PENDING)
                .build();

        return toResponse(playerRegistrationRepository.save(request));
    }

    public List<PlayerRegistrationResponse> listMine(User parent) {
        if (parent.getRole() != UserRole.PARENT) {
            throw new AccessDeniedException("Only PARENT users can view their registration requests");
        }
        return playerRegistrationRepository.findByParentUserId(parent.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PlayerRegistrationResponse> listManage(User user) {
        List<PlayerRegistrationRequest> requests = switch (user.getRole()) {
            case ADMIN    -> playerRegistrationRepository.findAllWithAssociations();
            case DIRECTOR -> user.getClub() != null
                    ? playerRegistrationRepository.findByTeamClubIdWithAssociations(user.getClub().getId())
                    : Collections.emptyList();
            case COACH    -> {
                List<Long> teamIds = coachTeamAssignmentRepository.findTeamIdsByCoachUserId(user.getId());
                yield teamIds.isEmpty()
                        ? Collections.emptyList()
                        : playerRegistrationRepository.findByTeamIdInWithAssociations(teamIds);
            }
            default -> throw new AccessDeniedException("Access denied");
        };
        return requests.stream().map(this::toResponse).toList();
    }

    @Transactional
    public PlayerRegistrationResponse approve(User reviewer, Long id) {
        PlayerRegistrationRequest req = loadForReview(reviewer, id);

        Player player = Player.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .dateOfBirth(req.getDateOfBirth())
                .primaryPosition(req.getPrimaryPosition())
                .secondaryPosition(req.getSecondaryPosition())
                .strongFoot(req.getStrongFoot())
                .jerseyNumber(req.getJerseyNumber())
                .active(true)
                .build();
        player = playerRepository.save(player);

        playerTeamAssignmentRepository.save(PlayerTeamAssignment.builder()
                .player(player)
                .team(req.getTeam())
                .active(true)
                .build());

        parentPlayerRelationshipRepository.save(ParentPlayerRelationship.builder()
                .parentUser(req.getParentUser())
                .player(player)
                .relationshipType(RelationshipType.PARENT)
                .build());

        req.setStatus(RegistrationStatus.APPROVED);
        req.setReviewedByUser(reviewer);
        req.setReviewedAt(Instant.now());

        return toResponse(playerRegistrationRepository.save(req));
    }

    @Transactional
    public PlayerRegistrationResponse reject(User reviewer, Long id, PlayerRegistrationRejectInput input) {
        PlayerRegistrationRequest req = loadForReview(reviewer, id);

        req.setStatus(RegistrationStatus.REJECTED);
        req.setReviewedByUser(reviewer);
        req.setReviewedAt(Instant.now());
        req.setRejectionReason(input.getReason());

        return toResponse(playerRegistrationRepository.save(req));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private PlayerRegistrationRequest loadForReview(User reviewer, Long id) {
        PlayerRegistrationRequest req = playerRegistrationRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new EntityNotFoundException("Player registration request not found with id: " + id));

        Long teamId = req.getTeam().getId();
        Long clubId = req.getTeam().getClub().getId();
        if (!authorizationService.canReviewForTeam(reviewer, teamId, clubId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (req.getStatus() != RegistrationStatus.PENDING) {
            throw new IllegalArgumentException("Request is already " + req.getStatus());
        }
        return req;
    }

    private PlayerRegistrationResponse toResponse(PlayerRegistrationRequest req) {
        User parent = req.getParentUser();
        User reviewer = req.getReviewedByUser();
        return PlayerRegistrationResponse.builder()
                .id(req.getId())
                .parentUserId(parent.getId())
                .parentUserName(parent.getFirstName() + " " + parent.getLastName())
                .teamId(req.getTeam().getId())
                .teamName(req.getTeam().getName())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .dateOfBirth(req.getDateOfBirth())
                .primaryPosition(req.getPrimaryPosition())
                .secondaryPosition(req.getSecondaryPosition())
                .strongFoot(req.getStrongFoot())
                .jerseyNumber(req.getJerseyNumber())
                .status(req.getStatus())
                .reviewedByUserId(reviewer != null ? reviewer.getId() : null)
                .reviewedByUserName(reviewer != null ? reviewer.getFirstName() + " " + reviewer.getLastName() : null)
                .reviewedAt(req.getReviewedAt())
                .rejectionReason(req.getRejectionReason())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
