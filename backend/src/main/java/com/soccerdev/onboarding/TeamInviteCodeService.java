package com.soccerdev.onboarding;

import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamInviteCodeService {

    private final TeamInviteCodeRepository teamInviteCodeRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public TeamInviteCodeResponse create(User admin, TeamInviteCodeInput input) {
        if (admin.getRole() != UserRole.ADMIN && admin.getRole() != UserRole.DIRECTOR) {
            throw new AccessDeniedException("Only admins can create team invite codes");
        }
        Team team = teamRepository.findById(input.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found"));

        var existing = teamInviteCodeRepository.findActiveByTeamId(team.getId());
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException(
                    "An active team code already exists for this team: " + existing.get(0).getCode());
        }

        byte[] bytes = new byte[4];
        secureRandom.nextBytes(bytes);
        String code = HexFormat.of().formatHex(bytes).toUpperCase();

        TeamInviteCode invite = TeamInviteCode.builder()
                .code(code)
                .team(team)
                .maxUses(input.getMaxUses())
                .createdByUser(admin)
                .build();
        return toResponse(teamInviteCodeRepository.save(invite));
    }

    public List<TeamInviteCodeResponse> listAll(User admin) {
        if (admin.getRole() != UserRole.ADMIN && admin.getRole() != UserRole.DIRECTOR) {
            throw new AccessDeniedException("Access denied");
        }
        return teamInviteCodeRepository.findAllWithAssociations().stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public TeamInviteCodeResponse disable(User admin, Long id) {
        if (admin.getRole() != UserRole.ADMIN && admin.getRole() != UserRole.DIRECTOR) {
            throw new AccessDeniedException("Access denied");
        }
        TeamInviteCode code = teamInviteCodeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Team invite code not found"));
        code.setActive(false);
        return toResponse(teamInviteCodeRepository.save(code));
    }

    /** Validates and returns the team for a given invite code (used when parent submits a child registration). */
    @Transactional
    public Team resolveAndConsume(String codeStr) {
        TeamInviteCode code = teamInviteCodeRepository.findByCodeWithTeam(codeStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid team invite code"));

        if (!code.isActive())
            throw new IllegalArgumentException("This team invite code is no longer active");
        if (code.getExpiresAt() != null && code.getExpiresAt().isBefore(Instant.now()))
            throw new IllegalArgumentException("This team invite code has expired");
        if (code.getMaxUses() != null && code.getUsesCount() >= code.getMaxUses())
            throw new IllegalArgumentException("This team invite code has reached its maximum uses");

        code.setUsesCount(code.getUsesCount() + 1);
        teamInviteCodeRepository.save(code);
        return code.getTeam();
    }

    /** Lookup without consuming — for UI preview (show team name before submitting). */
    public TeamInviteCodeResponse lookup(String codeStr) {
        TeamInviteCode code = teamInviteCodeRepository.findByCodeWithTeam(codeStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid team invite code"));
        if (!code.isActive())
            throw new IllegalArgumentException("This team invite code is no longer active");
        return toResponse(code);
    }

    /** Returns active players on the team for the given invite code (parent uses this to find their child). */
    public List<TeamPlayerDto> lookupPlayers(String codeStr) {
        TeamInviteCode code = teamInviteCodeRepository.findByCodeWithTeam(codeStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid team invite code"));
        if (!code.isActive())
            throw new IllegalArgumentException("This team invite code is no longer active");
        return playerRepository.findByTeamId(code.getTeam().getId()).stream()
                .filter(Player::isActive)
                .map(p -> TeamPlayerDto.builder()
                        .id(p.getId())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .primaryPosition(p.getPrimaryPosition() != null ? p.getPrimaryPosition().name() : null)
                        .jerseyNumber(p.getJerseyNumber())
                        .profileImageUrl(p.getProfileImageUrl())
                        .build())
                .toList();
    }

    private TeamInviteCodeResponse toResponse(TeamInviteCode c) {
        return TeamInviteCodeResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .teamId(c.getTeam().getId())
                .teamName(c.getTeam().getName())
                .active(c.isActive())
                .maxUses(c.getMaxUses())
                .usesCount(c.getUsesCount())
                .expiresAt(c.getExpiresAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
