package com.soccerdev.player;

import com.soccerdev.security.AuthorizationService;
import com.soccerdev.team.PlayerTeamAssignment;
import com.soccerdev.team.PlayerTeamAssignmentRepository;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final PlayerTeamAssignmentRepository playerTeamAssignmentRepository;
    private final AuthorizationService authorizationService;

    public List<PlayerResponse> list(User user) {
        List<Player> players = switch (user.getRole()) {
            case ADMIN    -> playerRepository.findAllWithTeams();
            case DIRECTOR -> user.getClub() != null
                    ? playerRepository.findByTeamClubId(user.getClub().getId())
                    : Collections.emptyList();
            case COACH    -> playerRepository.findByAssignedCoachId(user.getId());
            case PARENT   -> playerRepository.findByParentId(user.getId());
            case PLAYER   -> Collections.emptyList();
        };
        return players.stream().map(this::toResponse).toList();
    }

    public PlayerResponse getById(User user, Long id) {
        Player player = findWithTeams(id);
        if (!authorizationService.canViewPlayer(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        return toResponse(player);
    }

    @Transactional
    public PlayerResponse create(User user, PlayerRequest request) {
        Team team = null;
        if (request.getTeamId() != null) {
            if (!authorizationService.canEditTeam(user, request.getTeamId())) {
                throw new AccessDeniedException("Access denied");
            }
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + request.getTeamId()));
        } else if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.DIRECTOR) {
            throw new AccessDeniedException("Access denied");
        }

        Player player = Player.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .primaryPosition(request.getPrimaryPosition())
                .secondaryPosition(request.getSecondaryPosition())
                .strongFoot(request.getStrongFoot())
                .jerseyNumber(request.getJerseyNumber())
                .publicProfileEnabled(request.isPublicProfileEnabled())
                .build();
        player = playerRepository.save(player);

        if (team != null) {
            playerTeamAssignmentRepository.save(PlayerTeamAssignment.builder()
                    .player(player)
                    .team(team)
                    .active(true)
                    .build());
        }

        return toResponse(findWithTeams(player.getId()));
    }

    @Transactional
    public PlayerResponse update(User user, Long id, PlayerRequest request) {
        Player player = findWithTeams(id);
        if (!authorizationService.canEditPlayer(user, id)) {
            throw new AccessDeniedException("Access denied");
        }

        player.setFirstName(request.getFirstName());
        player.setLastName(request.getLastName());
        player.setDateOfBirth(request.getDateOfBirth());
        player.setPrimaryPosition(request.getPrimaryPosition());
        player.setSecondaryPosition(request.getSecondaryPosition());
        player.setStrongFoot(request.getStrongFoot());
        player.setJerseyNumber(request.getJerseyNumber());
        player.setPublicProfileEnabled(request.isPublicProfileEnabled());
        return toResponse(playerRepository.save(player));
    }

    @Transactional
    public PlayerResponse setPublicProfile(User user, Long id, boolean enabled) {
        if (user.getRole() != UserRole.PARENT) {
            throw new AccessDeniedException("Only parents can change a player's public profile visibility");
        }
        if (!authorizationService.canViewPlayer(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + id));
        player.setPublicProfileEnabled(enabled);
        return toResponse(playerRepository.save(player));
    }

    @Transactional
    public void delete(User user, Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + id));
        if (!authorizationService.canEditPlayer(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        player.setActive(false);
        playerRepository.save(player);
    }

    // ── Package-private helpers used by PlayerImageService ───────────────────

    PlayerResponse toResponse(Player player) {
        List<PlayerTeamSummary> teams = player.getTeamAssignments() == null
                ? List.of()
                : player.getTeamAssignments().stream()
                        .map(ta -> PlayerTeamSummary.builder()
                                .teamId(ta.getTeam().getId())
                                .teamName(ta.getTeam().getName())
                                .seasonId(ta.getSeason() != null ? ta.getSeason().getId() : null)
                                .seasonName(ta.getSeason() != null ? ta.getSeason().getName() : null)
                                .active(ta.isActive())
                                .joinedAt(ta.getJoinedAt())
                                .leftAt(ta.getLeftAt())
                                .build())
                        .toList();

        return PlayerResponse.builder()
                .id(player.getId())
                .teams(teams)
                .firstName(player.getFirstName())
                .lastName(player.getLastName())
                .dateOfBirth(player.getDateOfBirth())
                .primaryPosition(player.getPrimaryPosition())
                .secondaryPosition(player.getSecondaryPosition())
                .strongFoot(player.getStrongFoot())
                .jerseyNumber(player.getJerseyNumber())
                .publicProfileEnabled(player.isPublicProfileEnabled())
                .profileImageUrl(player.getProfileImageUrl())
                .active(player.isActive())
                .createdAt(player.getCreatedAt())
                .updatedAt(player.getUpdatedAt())
                .build();
    }

    private Player findWithTeams(Long id) {
        return playerRepository.findByIdWithTeams(id)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + id));
    }
}
