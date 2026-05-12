package com.soccerdev.competition;

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
public class CompetitionService {

    private final CompetitionRepository competitionRepository;

    public List<CompetitionResponse> list(String state) {
        List<Competition> competitions = (state != null && !state.isBlank())
                ? competitionRepository.findByState(state.toUpperCase().trim())
                : competitionRepository.findAllOrdered();
        return competitions.stream().map(this::toResponse).toList();
    }

    @Transactional
    public CompetitionResponse create(User user, CompetitionRequest request) {
        requireEditor(user);
        Competition competition = Competition.builder()
                .name(request.getName())
                .type(request.getType())
                .build();
        return toResponse(competitionRepository.save(competition));
    }

    @Transactional
    public CompetitionResponse update(User user, Long id, CompetitionRequest request) {
        requireEditor(user);
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Competition not found with id: " + id));
        competition.setName(request.getName());
        competition.setType(request.getType());
        return toResponse(competitionRepository.save(competition));
    }

    private void requireEditor(User user) {
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.DIRECTOR) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private CompetitionResponse toResponse(Competition competition) {
        return CompetitionResponse.builder()
                .id(competition.getId())
                .name(competition.getName())
                .type(competition.getType())
                .region(competition.getRegion())
                .level(competition.getLevel())
                .location(competition.getLocation())
                .compSeason(competition.getCompSeason())
                .preset(competition.isPreset())
                .states(competition.getStates())
                .build();
    }
}
