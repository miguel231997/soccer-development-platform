package com.soccerdev.season;

import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeasonPhaseService {

    private final SeasonPhaseRepository seasonPhaseRepository;
    private final SeasonRepository seasonRepository;

    public List<SeasonPhaseResponse> listBySeason(Long seasonId) {
        if (!seasonRepository.existsById(seasonId)) {
            throw new EntityNotFoundException("Season not found with id: " + seasonId);
        }
        return seasonPhaseRepository.findBySeasonIdOrderByStartDateAsc(seasonId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SeasonPhaseResponse create(User user, Long seasonId, SeasonPhaseRequest request) {
        requireEditor(user);
        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new EntityNotFoundException("Season not found with id: " + seasonId));
        SeasonPhase phase = SeasonPhase.builder()
                .season(season)
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        return toResponse(seasonPhaseRepository.save(phase));
    }

    @Transactional
    public SeasonPhaseResponse update(User user, Long id, SeasonPhaseRequest request) {
        requireEditor(user);
        SeasonPhase phase = seasonPhaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Season phase not found with id: " + id));
        phase.setName(request.getName());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        return toResponse(seasonPhaseRepository.save(phase));
    }

    private void requireEditor(User user) {
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.DIRECTOR && user.getRole() != UserRole.COACH) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private SeasonPhaseResponse toResponse(SeasonPhase phase) {
        return SeasonPhaseResponse.builder()
                .id(phase.getId())
                .seasonId(phase.getSeason().getId())
                .seasonName(phase.getSeason().getName())
                .name(phase.getName())
                .startDate(phase.getStartDate())
                .endDate(phase.getEndDate())
                .build();
    }
}
