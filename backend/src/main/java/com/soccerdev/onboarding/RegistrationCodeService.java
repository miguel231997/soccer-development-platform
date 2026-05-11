package com.soccerdev.onboarding;

import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationCodeService {

    private final RegistrationCodeRepository registrationCodeRepository;
    private final TeamRepository teamRepository;

    @Transactional
    public RegistrationCodeResponse create(User admin, RegistrationCodeInput input) {
        requireAdmin(admin);

        if (input.getRole() != UserRole.COACH && input.getRole() != UserRole.PARENT) {
            throw new IllegalArgumentException(
                    "Registration codes can only be created for COACH or PARENT roles");
        }

        Team team = teamRepository.findById(input.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + input.getTeamId()));

        String code = generateUniqueCode();

        RegistrationCode rc = RegistrationCode.builder()
                .code(code)
                .team(team)
                .role(input.getRole())
                .active(true)
                .expiresAt(input.getExpiresAt())
                .maxUses(input.getMaxUses())
                .usesCount(0)
                .createdByUser(admin)
                .build();

        return toResponse(registrationCodeRepository.save(rc));
    }

    public List<RegistrationCodeResponse> list(User admin) {
        requireAdmin(admin);
        return registrationCodeRepository.findAllWithAssociations().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RegistrationCodeResponse disable(User admin, Long id) {
        requireAdmin(admin);
        RegistrationCode rc = registrationCodeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registration code not found with id: " + id));
        rc.setActive(false);
        return toResponse(registrationCodeRepository.save(rc));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void requireAdmin(User user) {
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (registrationCodeRepository.existsByCode(code));
        return code;
    }

    private RegistrationCodeResponse toResponse(RegistrationCode rc) {
        User author = rc.getCreatedByUser();
        return RegistrationCodeResponse.builder()
                .id(rc.getId())
                .code(rc.getCode())
                .teamId(rc.getTeam().getId())
                .teamName(rc.getTeam().getName())
                .role(rc.getRole())
                .active(rc.isActive())
                .expiresAt(rc.getExpiresAt())
                .maxUses(rc.getMaxUses())
                .usesCount(rc.getUsesCount())
                .createdByUserId(author.getId())
                .createdByUserName(author.getFirstName() + " " + author.getLastName())
                .createdAt(rc.getCreatedAt())
                .updatedAt(rc.getUpdatedAt())
                .build();
    }
}
