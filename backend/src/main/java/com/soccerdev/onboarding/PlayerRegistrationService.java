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
    private final PlayerRepository playerRepository;
    private final ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    private final PlayerTeamAssignmentRepository playerTeamAssignmentRepository;
    private final CoachTeamAssignmentRepository coachTeamAssignmentRepository;
    private final AuthorizationService authorizationService;
    private final TeamInviteCodeService teamInviteCodeService;

    @Transactional
    public PlayerRegistrationResponse create(User parent, PlayerRegistrationInput input) {
        if (parent.getRole() != UserRole.PARENT) {
            throw new AccessDeniedException("Only PARENT users can submit player registration requests");
        }

        // Validate and consume the team invite code
        Team team = teamInviteCodeService.resolveAndConsume(input.getTeamInviteCode());

        Player existingPlayer = null;
        if (input.getExistingPlayerId() != null) {
            existingPlayer = playerRepository.findById(input.getExistingPlayerId())
                    .orElseThrow(() -> new EntityNotFoundException("Player not found: " + input.getExistingPlayerId()));
            // Verify the parent actually owns this player
            if (!parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), existingPlayer.getId())) {
                throw new AccessDeniedException("This player is not linked to your account");
            }
        } else {
            // New child: require name/dob/position
            if (input.getFirstName() == null || input.getFirstName().isBlank())
                throw new IllegalArgumentException("firstName is required");
            if (input.getLastName() == null || input.getLastName().isBlank())
                throw new IllegalArgumentException("lastName is required");
            if (input.getDateOfBirth() == null)
                throw new IllegalArgumentException("dateOfBirth is required");
            if (input.getPrimaryPosition() == null)
                throw new IllegalArgumentException("primaryPosition is required");
        }

        String firstName = existingPlayer != null ? existingPlayer.getFirstName() : input.getFirstName();
        String lastName  = existingPlayer != null ? existingPlayer.getLastName()  : input.getLastName();

        PlayerRegistrationRequest request = PlayerRegistrationRequest.builder()
                .parentUser(parent)
                .team(team)
                .existingPlayer(existingPlayer)
                .firstName(firstName)
                .lastName(lastName)
                .dateOfBirth(existingPlayer != null ? existingPlayer.getDateOfBirth() : input.getDateOfBirth())
                .primaryPosition(existingPlayer != null ? existingPlayer.getPrimaryPosition() : input.getPrimaryPosition())
                .secondaryPosition(existingPlayer != null ? existingPlayer.getSecondaryPosition() : input.getSecondaryPosition())
                .strongFoot(existingPlayer != null ? existingPlayer.getStrongFoot() : input.getStrongFoot())
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

        Player player;
        if (req.getExistingPlayer() != null) {
            // Child is already registered — just add a new team assignment
            player = req.getExistingPlayer();
        } else {
            // New child: create the player record and parent relationship
            player = Player.builder()
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

            parentPlayerRelationshipRepository.save(ParentPlayerRelationship.builder()
                    .parentUser(req.getParentUser())
                    .player(player)
                    .relationshipType(RelationshipType.PARENT)
                    .build());
        }

        playerTeamAssignmentRepository.save(PlayerTeamAssignment.builder()
                .player(player)
                .team(req.getTeam())
                .active(true)
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
                .existingPlayerId(req.getExistingPlayer() != null ? req.getExistingPlayer().getId() : null)
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
